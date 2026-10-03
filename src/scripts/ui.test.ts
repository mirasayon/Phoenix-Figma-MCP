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
          value: id === "port" ? "3055" : "cursor-figma",
          style: {},
          classList: { add() {}, remove() {} },
          addEventListener() {},
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
    constructor() {
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
      channel: "cursor-figma",
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
  assert.equal(
    elements.get("connection-status").textContent,
    `Connected to server in channel: ${channel}`,
  );
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
});
