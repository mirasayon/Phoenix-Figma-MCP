import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { WebSocket } from "ws";

export function within<T>(promise: Promise<T>, milliseconds = 5000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Test operation timed out")), milliseconds);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function stopProcess(child: ChildProcess) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, "exit");
  child.kill();
  await within(exited);
}

export async function startRelay(port = 0) {
  const child = spawn(process.execPath, [fileURLToPath(new URL("../socket.ts", import.meta.url))], {
    env: { ...process.env, WS_PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  let errors = "";
  child.stderr.on("data", (data) => (errors += data.toString()));
  try {
    const actualPort = await within(
      new Promise<number>((resolve, reject) => {
        child.on("error", reject);
        child.on("exit", () => reject(new Error(`Relay exited before listening: ${errors}`)));
        child.stdout.on("data", (data) => {
          output += data.toString();
          const match = output.match(/WebSocket server running on port (\d+)/);
          if (match) resolve(Number(match[1]));
        });
      }),
    );
    return { child, port: actualPort };
  } catch (error) {
    await stopProcess(child);
    throw error;
  }
}

export function waitForMessage(ws: WebSocket, predicate: (message: any) => boolean) {
  let cleanup = () => {};
  return within(
    new Promise<any>((resolve, reject) => {
      const onMessage = (raw: WebSocket.RawData) => {
        try {
          const message = JSON.parse(raw.toString());
          if (predicate(message)) resolve(message);
        } catch (error) {
          reject(error);
        }
      };
      const onClose = () => reject(new Error("Peer closed before receiving a message"));
      ws.on("message", onMessage);
      ws.once("close", onClose);
      // Remove listeners on success, error, and timeout.
      cleanup = () => {
        ws.off("message", onMessage);
        ws.off("close", onClose);
      };
    }),
  ).finally(() => cleanup());
}

export async function openPeer(port: number, channel: string) {
  const ws = new WebSocket(`ws://localhost:${port}`);
  ws.on("error", () => {});
  try {
    await within(once(ws, "open"));
    const joined = waitForMessage(ws, (data) => data.message?.id === "test-join");
    ws.send(JSON.stringify({ type: "join", channel, id: "test-join" }));
    await joined;
    return ws;
  } catch (error) {
    ws.terminate();
    throw error;
  }
}
