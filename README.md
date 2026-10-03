# Phoenix Figma MCP

Read and edit an open Figma file from Cursor or another MCP client through a local Figma plugin.
No Figma API token is needed.

## Requirements

- Node.js 24+ and npm.
- Figma Desktop.
- Cursor or another MCP client with stdio support.

## Setup

### 1. Install and start the relay

```bash
git clone https://github.com/mirasayon/phoenix-figma-mcp.git
cd phoenix-figma-mcp
npm ci
npm run socket
```

`npm run socket` builds the plugin and starts the relay at `ws://localhost:3055`.
Keep this terminal open.

### 2. Connect the Figma plugin

1. Open your design file in Figma Desktop.
2. Go to **Plugins → Development → Import plugin from manifest…** and select
   [`src/manifest.json`](src/manifest.json) from the cloned repository.
3. Run **Plugins → Development → figma mcp**.
4. Click **Connect**, keeping port `3055` and channel `cursor-figma`.

Keep the plugin panel open while you work.

### 3. Configure your MCP client

For Cursor, add this server to `~/.cursor/mcp.json`
(on Windows: `%USERPROFILE%\.cursor\mcp.json`):

```json
{
  "mcpServers": {
    "figma-mcp-mh": {
      "command": "node",
      "args": ["/absolute/path/to/phoenix-figma-mcp/src/server.ts"]
    }
  }
}
```

Replace the example with the **absolute path** to `src/server.ts`.
On Windows, use forward slashes, for example `C:/projects/phoenix-figma-mcp/src/server.ts`.

Reload MCP servers or restart Cursor. The client starts the MCP server and joins
`cursor-figma` automatically.

### 4. Use it

Ask your client to “Read my current selection” or “Create a 400×300 frame named Hero”.
Reads and edits apply to the file where the plugin is running. Closed files and Figma comments
are not supported.

For later sessions, start `npm run socket`, run the plugin, and click **Connect**.

## Connection problems

- **Tools time out:** check that the relay is running, the plugin shows **Connected**, and the
  channel is `cursor-figma`. If you use a custom channel, call `join_channel` with the same name.
- **MCP server missing:** check Node.js 24+, the absolute path in your MCP config, and the
  client's MCP logs; then reload the server.

Based on [cursor-talk-to-figma-mcp](https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp)
(MIT), adapted for Node.js.
