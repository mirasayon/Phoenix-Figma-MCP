import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";

function createUI() {
  const sockets: any[] = [];
  const posted: any[] = [];
  const elements = new Map<string, any>();
  const document = {
    getElementById(id: string) {
      if (!elements.has(id))
        elements.set(id, {
          value: id === "port" ? "3055" : id === "channel" ? "phoenix-figma" : "",
          style: {},
          classList: { add() {}, remove() {} },
          addEventListener() {},
          attributes: {},
          setAttribute(name: string, value: string) {
            this.attributes[name] = value;
          },
        });
      return elements.get(id);
    },
    querySelectorAll: () => [],
  };
  class Socket {
    static CONNECTING = 0;
    static OPEN = 1;
    readyState = 0;
    sent: any[] = [];
    url: string;
    constructor(url: string) {
      this.url = url;
      sockets.push(this);
    }
    send(data: string) {
      this.sent.push(JSON.parse(data));
    }
    close() {
      this.readyState = 3;
    }
  }
  const context = vm.createContext({
    document,
    WebSocket: Socket,
    console: { log() {}, error() {} },
    window: {},
    parent: { postMessage: (data: any) => posted.push(data.pluginMessage) },
    setTimeout,
    clearTimeout,
  });
  const source = readFileSync(new URL("../ui.html", import.meta.url), "utf8").match(
    /<script>([\s\S]*?)<\/script>/,
  )[1];
  vm.runInContext(source, context);
  return { context, sockets, posted, elements };
}

test("UI keeps one connecting socket and ignores stale close events", async () => {
  const { context, sockets } = createUI();
  await context.connectToServer(3055);
  await context.connectToServer(3055);
  assert.equal(sockets.length, 1);
  context.disconnectFromServer();
  await context.connectToServer(3055);
  const current = sockets[1];
  current.readyState = 1;
  current.onopen();
  current.onmessage({
    data: JSON.stringify({
      type: "system",
      channel: "phoenix-figma",
      message: { result: "joined" },
    }),
  });
  sockets[0].onclose();
  context.sendSuccessResponse("request", { ok: true });
  assert.equal(current.sent.at(-1).message.id, "request");
  const pending = context.sendCommand("get_selection", {});
  context.disconnectFromServer();
  await assert.rejects(pending, /Connection closed/);
});

test("UI forwards concurrent progress by command ID and renders channel names as text", async () => {
  const { context, sockets, posted, elements } = createUI();
  const channel = "<img src=x onerror=alert(1)>";
  elements.get("channel").value = channel;
  await context.connectToServer(3055);
  const socket = sockets[0];
  socket.readyState = 1;
  socket.onopen();
  socket.onmessage({
    data: JSON.stringify({ type: "system", channel, message: { result: "joined" } }),
  });
  assert.equal(elements.get("connection-status").textContent, `Connected to relay · ${channel}`);
  assert.equal(elements.get("connection-status").innerHTML, undefined);
  await context.handleSocketMessage({ message: { id: "a", command: "get_reactions", params: {} } });
  await context.handleSocketMessage({
    message: { id: "b", command: "scan_text_nodes", params: {} },
  });
  assert.equal(posted.find((message) => message.id === "a").params.commandId, "a");
  context.window.onmessage({
    data: {
      pluginMessage: {
        type: "command_progress",
        commandId: "a",
        status: "in_progress",
        progress: 20,
      },
    },
  });
  assert.equal(socket.sent.at(-1).id, "a");
  assert.equal(socket.sent.at(-1).message.data.commandId, "a");
  await context.handleSocketMessage({ message: null });
  await context.handleSocketMessage({ message: "A user has left the channel" });
  context.disconnectFromServer();
  assert.equal(elements.get("progress-bar").attributes["aria-valuenow"], "0");
});

test("UI config is available before connection and matches saved settings", async () => {
  const { context, sockets, posted, elements } = createUI();
  const initial = JSON.parse(elements.get("mcp-json").value).mcpServers["phoenix-figma-mcp"];
  assert.equal(initial.command, "node");
  assert.deepEqual(initial.args, ["/absolute/path/to/phoenix-figma-mcp/src/server.ts"]);
  assert.deepEqual(initial.env, { WS_PORT: "3055", WS_CHANNEL: "phoenix-figma" });

  context.window.onmessage({
    data: {
      pluginMessage: {
        type: "init-settings",
        settings: { serverPort: 3066, channel: " project-alpha " },
      },
    },
  });
  elements.get("server-path").value = "C:\\work\\Phoenix Figma MCP\\src\\server.ts";
  context.updateMcpConfig();
  const config = JSON.parse(elements.get("mcp-json").value).mcpServers["phoenix-figma-mcp"];
  assert.deepEqual(config.args, ["C:/work/Phoenix Figma MCP/src/server.ts"]);
  assert.deepEqual(config.env, { WS_PORT: "3066", WS_CHANNEL: "project-alpha" });
  await context.connectToServer(3066);
  assert.equal(sockets[0].url, "ws://localhost:3066");
  assert.equal(elements.get("btn-connect").disabled, true);
  assert.equal(elements.get("channel").disabled, true);
  sockets[0].readyState = 1;
  sockets[0].onopen();
  assert.equal(sockets[0].sent[0].channel, "project-alpha");
  sockets[0].onmessage({
    data: JSON.stringify({
      type: "system",
      channel: "project-alpha",
      message: { result: "joined" },
    }),
  });
  const saved = posted.find((message) => message.type === "update-settings");
  assert.equal(saved.serverPort, 3066);
  assert.equal(saved.channel, "project-alpha");
  assert.equal(elements.get("btn-connect").disabled, false);
  context.disconnectFromServer();
  assert.equal(elements.get("channel").disabled, false);
});

test("UI rejects invalid ports and recovers after a failed connection", async () => {
  const { context, sockets, elements } = createUI();
  for (const port of [0, -1, 65536, 1.5, NaN]) await context.connectToServer(port);
  assert.equal(sockets.length, 0);
  assert.equal(elements.get("connection-status").className, "status error");
  await context.connectToServer(3055);
  sockets[0].onerror(new Error("Unavailable"));
  assert.equal(elements.get("btn-connect").disabled, false);
  assert.equal(elements.get("port").disabled, false);
  assert.match(elements.get("connection-status").textContent, /pnpm run socket/);
  await context.connectToServer(3055);
  assert.equal(sockets.length, 2);
  context.disconnectFromServer();
});
