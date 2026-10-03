// Verify a request/response exchange on an isolated relay and always clean up.
import assert from "node:assert/strict";
import { WebSocket } from "ws";
import { openPeer, startRelay, stopProcess, waitForMessage } from "./test-utils.ts";

const relay = await startRelay();
const channel = "smoke-test";
let peerA: WebSocket;
let peerB: WebSocket;

try {
  peerA = await openPeer(relay.port, channel);
  peerB = await openPeer(relay.port, channel);
  peerB.on("message", (raw) => {
    const data = JSON.parse(raw.toString());
    if (data.type === "broadcast" && data.message?.command) {
      peerB.send(
        JSON.stringify({
          type: "message",
          channel,
          message: { id: data.message.id, result: { ok: true, echoed: data.message.command } },
        }),
      );
    }
  });
  const response = waitForMessage(peerA, (data) => data.message?.id === "req-1");
  peerA.send(
    JSON.stringify({
      type: "message",
      channel,
      message: { id: "req-1", command: "create_frame", params: {} },
    }),
  );
  const result = (await response).message.result;
  assert.deepEqual(result, { ok: true, echoed: "create_frame" });
  console.log("PASS: relay round-trip ok ->", JSON.stringify(result));
} finally {
  peerA?.terminate();
  peerB?.terminate();
  await stopProcess(relay.child);
}
