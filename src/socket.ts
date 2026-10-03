#!/usr/bin/env node

import { WebSocketServer, WebSocket } from "ws";

const PORT = Number(process.env.WS_PORT ?? 3055);
if (!Number.isInteger(PORT) || PORT < 0 || PORT > 65535) {
  throw new Error("WS_PORT must be an integer between 0 and 65535");
}

// Store clients by channel
const channels = new Map<string, Set<WebSocket>>();
const joinedChannels = new Map<WebSocket, string>();

function leaveChannel(ws: WebSocket) {
  const channelName = joinedChannels.get(ws);
  if (!channelName) return;
  joinedChannels.delete(ws);
  const clients = channels.get(channelName);
  if (!clients) return;
  clients.delete(ws);
  if (clients.size === 0) {
    channels.delete(channelName);
  } else {
    broadcastToChannel(channelName, null, {
      type: "system",
      message: "A user has left the channel",
      channel: channelName,
    });
  }
}

function broadcastToChannel(channelName: string, sender: WebSocket | null, payload: unknown) {
  const clients = channels.get(channelName);
  if (!clients) return 0;
  let count = 0;
  for (const client of clients) {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      count++;
      client.send(JSON.stringify(payload));
    }
  }
  return count;
}

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      if (!data || typeof data !== "object" || Array.isArray(data)) return;
      console.log(`\n=== Received message from client ===`);
      console.log(`Type: ${data.type}, Channel: ${data.channel || "N/A"}`);
      if (data.message?.command) {
        console.log(`Command: ${data.message.command}, ID: ${data.id}`);
      } else if (data.message?.result) {
        console.log(`Response: ID: ${data.id}, Has Result: ${!!data.message.result}`);
      }

      // Join a channel
      if (data.type === "join") {
        const channelName = typeof data.channel === "string" ? data.channel.trim() : "";
        if (!channelName) {
          ws.send(
            JSON.stringify({ type: "error", id: data.id, message: "Channel name is required" }),
          );
          return;
        }

        if (joinedChannels.get(ws) !== channelName) leaveChannel(ws);

        if (!channels.has(channelName)) {
          channels.set(channelName, new Set());
        }

        const channelClients = channels.get(channelName)!;
        channelClients.add(ws);
        joinedChannels.set(ws, channelName);

        console.log(
          `\n\u2713 Client joined channel "${channelName}" (${channelClients.size} total clients)`,
        );

        // Notify client they joined successfully
        ws.send(
          JSON.stringify({
            type: "system",
            message: `Joined channel: ${channelName}`,
            channel: channelName,
          }),
        );

        // Acknowledge the join request so the peer's pending request resolves
        ws.send(
          JSON.stringify({
            type: "system",
            message: {
              id: data.id,
              result: "Connected to channel: " + channelName,
            },
            channel: channelName,
          }),
        );

        // Notify other clients in the channel
        broadcastToChannel(channelName, ws, {
          type: "system",
          message: "A new user has joined the channel",
          channel: channelName,
        });
        return;
      }

      // Relay regular request/response messages between peers
      if (data.type === "message") {
        const channelName = data.channel;
        if (!channelName || typeof channelName !== "string") {
          ws.send(
            JSON.stringify({ type: "error", id: data.id, message: "Channel name is required" }),
          );
          return;
        }

        const channelClients = channels.get(channelName);
        if (!channelClients || !channelClients.has(ws)) {
          ws.send(
            JSON.stringify({
              type: "error",
              id: data.id,
              message: "You must join the channel first",
            }),
          );
          return;
        }

        const broadcastCount = broadcastToChannel(channelName, ws, {
          type: "broadcast",
          message: data.message,
          sender: "peer",
          channel: channelName,
        });

        if (broadcastCount === 0) {
          console.log(
            `\u26a0\ufe0f  No other clients in channel "${channelName}" to receive message!`,
          );
        } else {
          console.log(`\u2713 Broadcast to ${broadcastCount} peer(s) in channel "${channelName}"`);
        }
        return;
      }

      // Forward progress updates to the other peer in the channel
      if (data.type === "progress_update") {
        const channelName = data.channel;
        if (!channelName) return;
        const channelClients = channels.get(channelName);
        if (!channelClients || !channelClients.has(ws)) return;
        broadcastToChannel(channelName, ws, data);
        return;
      }
    } catch (err) {
      console.error("Error handling message:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    leaveChannel(ws);
  });

  ws.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

wss.on("listening", () => {
  const address = wss.address();
  if (address && typeof address === "object") {
    console.log(`WebSocket server running on port ${address.port}`);
  }
});
