import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { WebSocket } from "ws";
import { openPeer, startRelay, stopProcess, waitForMessage, within } from "./test-utils.ts";

const quiet = { log() {}, warn() {}, error() {} };
const pluginSource = readFileSync(new URL("../code.js", import.meta.url), "utf8");

function createPlugin(postMessage: (message: any) => void) {
  const exports: any[] = [];
  const node = {
    id: "1:1",
    name: "Icon",
    type: "VECTOR",
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    remove() {},
    exportAsync: async (settings: any) => {
      exports.push(settings);
      return settings.format === "JSON_REST_V1"
        ? {
            document: {
              id: "1:1",
              name: "Icon",
              type: "VECTOR",
              fills: [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }],
              strokes: [{ type: "SOLID", color: { r: 0, g: 0, b: 1, a: 0.5 } }],
              children: [{ id: "1:2", type: "VECTOR", name: "Child" }],
            },
          }
        : new Uint8Array([0, 128, 255, 1]);
    },
  };
  const figma = {
    ui: { onmessage: null as any, postMessage },
    showUI() {},
    on() {},
    notify() {},
    clientStorage: {
      getAsync: async (key: string) => (key === "defaultConnectorId" ? "connector" : undefined),
      setAsync: async () => {},
    },
    currentPage: { selection: [node] },
    root: { children: [] },
    getNodeByIdAsync: async (id: string) =>
      id === node.id
        ? node
        : id === "connector"
          ? { id, type: "CONNECTOR", clone: () => ({ id: "new-connector" }) }
          : null,
  };
  vm.runInNewContext(pluginSource, { figma, __html__: "", console: quiet, setTimeout });
  return {
    exports,
    execute: (id: string, command: string, params = {}) =>
      figma.ui.onmessage({ type: "execute-command", id, command, params }),
  };
}

test("plugin preserves vectors, honors export formats, and correlates progress", async () => {
  const messages: any[] = [];
  const plugin = createPlugin((message) => messages.push(message));
  await plugin.execute("vector", "get_node_info", { nodeId: "1:1" });
  const node = messages.find((message) => message.id === "vector").result;
  assert.equal(node.type, "VECTOR");
  assert.equal(node.children[0].id, "1:2");
  assert.equal(node.fills[0].color, "#ff0000");
  assert.equal(node.strokes[0].color, "#0000ff80");

  const formats = {
    PNG: "image/png",
    JPG: "image/jpeg",
    SVG: "image/svg+xml",
    PDF: "application/pdf",
  };
  for (const [format, mimeType] of Object.entries(formats)) {
    await plugin.execute(format, "export_node_as_image", { nodeId: "1:1", format, scale: 2 });
    const result = messages.find((message) => message.id === format).result;
    assert.equal(result.format, format);
    assert.equal(result.mimeType, mimeType);
    assert.equal(result.imageData, Buffer.from([0, 128, 255, 1]).toString("base64"));
    const settings = plugin.exports.at(-1);
    assert.equal(settings.format, format);
    assert.equal(settings.constraint?.value, format === "PNG" || format === "JPG" ? 2 : undefined);
  }

  const commands = {
    get_reactions: { nodeIds: ["1:1"] },
    scan_nodes_by_types: { nodeId: "1:1", types: ["VECTOR"] },
    delete_multiple_nodes: { nodeIds: ["1:1"] },
    create_connections: { connections: [{ startNodeId: "1:1", endNodeId: "1:1" }] },
    get_local_components: {},
    scan_text_nodes: { nodeId: "1:1", useChunking: false },
  };
  await Promise.all(
    Object.entries(commands).map(([command, params]) => plugin.execute(command, command, params)),
  );
  for (const command of Object.keys(commands)) {
    const progress = messages.filter(
      (message) => message.type === "command_progress" && message.commandType === command,
    );
    assert.ok(progress.length, `Missing progress for ${command}`);
    assert.ok(
      progress.every((message) => message.commandId === command),
      `Wrong request ID for ${command}`,
    );
    const completed = progress.find((message) => message.status === "completed");
    if (completed) assert.equal(completed.progress, 100);
  }
});

test("MCP commands round-trip through relay and compiled plugin", { timeout: 20000 }, async (t) => {
  let relay = await startRelay();
  const port = relay.port;
  const peers = new Set<WebSocket>();
  const client = new Client({ name: "regression", version: "1.0.0" });
  t.after(async () => {
    await client.close();
    for (const peer of peers) peer.terminate();
    await stopProcess(relay.child);
  });

  const defaultChannel = "cursor-figma";
  const peer = await openPeer(port, defaultChannel);
  peers.add(peer);
  const overrides = new Map<string, any>();
  const plugin = createPlugin((message) => {
    const progress = message.type === "command_progress";
    const id = progress ? message.commandId : message.id;
    peer.send(
      JSON.stringify({
        type: progress ? "progress_update" : "message",
        id,
        channel: defaultChannel,
        message: progress
          ? { id, data: message }
          : {
              id,
              ...(message.type === "command-error"
                ? { error: message.error }
                : { result: message.result }),
            },
      }),
    );
  });
  peer.on("message", (raw) => {
    const data = JSON.parse(raw.toString());
    if (data.type !== "broadcast" || !data.message?.command) return;
    const { id, command, params } = data.message;
    if (overrides.has(command)) {
      peer.send(
        JSON.stringify({
          type: "message",
          channel: defaultChannel,
          message: { id, ...overrides.get(command) },
        }),
      );
    } else {
      plugin.execute(id, command, params).catch((error) => assert.fail(String(error)));
    }
  });

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL("../server.ts", import.meta.url))],
    env: { ...process.env, WS_PORT: String(port) } as Record<string, string>,
    stderr: "pipe",
  });
  let logs = "";
  let waitForJoin: (() => void) | null = null;
  let wantedChannel = defaultChannel;
  const joined = new Promise<void>((resolve) => (waitForJoin = resolve));
  transport.stderr.on("data", (data) => {
    const text = data.toString();
    logs += text;
    if (text.includes(`Joined channel: ${wantedChannel}`)) waitForJoin?.();
  });
  await within(client.connect(transport));
  await within(joined);
  const call = (name: string, args = {}) => within(client.callTool({ name, arguments: args }));

  const vector: any = await call("get_node_info", { nodeId: "1:1" });
  const info = JSON.parse(vector.content[0].text);
  assert.equal(info.type, "VECTOR");
  assert.equal(info.children[0].type, "VECTOR");
  assert.equal(info.fills[0].color, "#ff0000");

  for (const value of [false, 0, "", null]) {
    overrides.set("get_selection", { result: value });
    const response: any = await call("get_selection");
    assert.equal(response.content[0].text, JSON.stringify(value));
  }
  overrides.set("get_selection", { error: "Plugin rejected command" });
  const failure: any = await call("get_selection");
  assert.equal(failure.isError, true);
  assert.match(failure.content[0].text, /Plugin rejected command/);
  const missing: any = await call("get_node_info", { nodeId: "missing" });
  assert.equal(missing.isError, true);
  assert.match(missing.content[0].text, /Node not found/);

  const annotation: any = await call("set_annotation", {
    nodeId: "missing",
    labelMarkdown: "Note",
  });
  assert.equal(annotation.isError, true);
  assert.equal(JSON.parse(annotation.content[0].text).success, false);
  overrides.set("set_multiple_text_contents", {
    result: {
      success: true,
      replacementsApplied: 1,
      replacementsFailed: 1,
      results: [
        { success: true, nodeId: "ok" },
        { success: false, nodeId: "bad", error: "Font missing" },
      ],
    },
  });
  const partial: any = await call("set_multiple_text_contents", {
    nodeId: "1:1",
    text: [
      { nodeId: "ok", text: "Hello" },
      { nodeId: "bad", text: "World" },
    ],
  });
  assert.equal(partial.isError, true);
  assert.match(partial.content[1].text, /Font missing/);

  overrides.set("get_node_info", {
    result: {
      id: "rgb",
      type: "RECTANGLE",
      fills: [{ color: { r: 1, g: 0, b: 0 } }],
      strokes: [{ color: { r: 0, g: 0, b: 1, a: 0.5 } }],
    },
  });
  const rgb: any = await call("get_node_info", { nodeId: "rgb" });
  assert.equal(JSON.parse(rgb.content[0].text).fills[0].color, "#ff0000");
  assert.equal(JSON.parse(rgb.content[0].text).strokes[0].color, "#0000ff80");

  for (const format of ["PNG", "JPG", "SVG", "PDF"]) {
    const result: any = await call("export_node_as_image", { nodeId: "1:1", format });
    assert.equal(result.isError, undefined);
    assert.equal(
      result.content[0].type,
      format === "PNG" || format === "JPG" ? "image" : "resource",
    );
  }

  const channel = "isolated-test";
  const other = await openPeer(port, channel);
  peers.add(other);
  const switchResult: any = await call("join_channel", { channel });
  assert.equal(switchResult.isError, undefined);
  other.on("message", (raw) => {
    const data = JSON.parse(raw.toString());
    if (!data.message?.command) return;
    const id = data.message.id;
    // A response from the previous channel must never win this request.
    peer.send(
      JSON.stringify({
        type: "message",
        channel: defaultChannel,
        message: { id, result: { source: "old" } },
      }),
    );
    setTimeout(
      () =>
        other.send(
          JSON.stringify({ type: "message", channel, message: { id, result: { source: "new" } } }),
        ),
      50,
    );
  });
  const isolated: any = await call("get_selection");
  assert.equal(JSON.parse(isolated.content[0].text).source, "new");

  await stopProcess(relay.child);
  const rejoined = new Promise<void>((resolve) => (waitForJoin = resolve));
  wantedChannel = channel;
  relay = await startRelay(port);
  const replacement = await openPeer(port, channel);
  peers.add(replacement);
  replacement.on("message", (raw) => {
    const data = JSON.parse(raw.toString());
    if (data.message?.command)
      replacement.send(
        JSON.stringify({
          type: "message",
          channel,
          message: { id: data.message.id, result: { reconnected: true } },
        }),
      );
  });
  await within(rejoined);
  const afterRestart: any = await call("get_selection");
  assert.equal(JSON.parse(afterRestart.content[0].text).reconnected, true, logs);
});

test("relay reports invalid joins immediately and rejects messages from an old channel", async (t) => {
  const relay = await startRelay();
  const peer = await openPeer(relay.port, "first");
  t.after(async () => {
    peer.terminate();
    await stopProcess(relay.child);
  });
  const invalid = waitForMessage(peer, (data) => data.id === "invalid");
  peer.send(JSON.stringify({ type: "join", id: "invalid", channel: "   " }));
  assert.equal((await invalid).type, "error");
  const joined = waitForMessage(peer, (data) => data.message?.id === "second-join");
  peer.send(JSON.stringify({ type: "join", id: "second-join", channel: "second" }));
  await joined;
  const rejected = waitForMessage(peer, (data) => data.id === "old-message");
  peer.send(JSON.stringify({ type: "message", id: "old-message", channel: "first", message: {} }));
  assert.equal((await rejected).type, "error");
});
