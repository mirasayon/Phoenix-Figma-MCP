# Phoenix Figma MCP

Read and edit an open Figma file from Cursor or another MCP client through a local Figma plugin.
No Figma API token is needed.

## Requirements

- Node.js 24+ and pnpm (the version is pinned in `package.json`).
- Figma Desktop.
- Cursor or another MCP client with stdio support.

## Setup

### 1. Install and start the relay

```bash
git clone https://github.com/mirasayon/phoenix-figma-mcp.git
cd phoenix-figma-mcp
pnpm install --frozen-lockfile
pnpm run socket
```

`pnpm run socket` builds the plugin and starts the relay at `ws://localhost:3055`.
Keep this terminal open.

### 2. Connect the Figma plugin

1. Open your design file in Figma Desktop.
2. Go to **Plugins → Development → Import plugin from manifest…** and select
   [`src/manifest.json`](src/manifest.json) from the cloned repository.
3. Run **Plugins → Development → Phoenix Figma MCP**.
4. Click **Connect**, keeping port `3055` and channel `phoenix-figma`.

Keep the plugin panel open while you work.

### 3. Configure your MCP client

For Cursor, add this server to `~/.cursor/mcp.json`
(on Windows: `%USERPROFILE%\.cursor\mcp.json`):

```json
{
  "mcpServers": {
    "phoenix-figma-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/phoenix-figma-mcp/src/server.ts"],
      "env": {
        "WS_PORT": "3055",
        "WS_CHANNEL": "phoenix-figma"
      }
    }
  }
}
```

Replace the example with the **absolute path** to `src/server.ts`.
On Windows, use forward slashes, for example `C:/projects/phoenix-figma-mcp/src/server.ts`.

Reload MCP servers or restart Cursor. The client starts the MCP server and joins
`phoenix-figma` automatically. The plugin's **Setup** tab can generate and copy this config.

### 4. Use it

Ask your client to “Read my current selection” or “Create a 400×300 frame named Hero”.
Reads and edits apply to the file where the plugin is running. Closed files and Figma comments
are not supported.

For later sessions, start `pnpm run socket`, run the plugin, and click **Connect**.

## Connection problems

- **Tools time out:** check that the relay is running, the plugin shows **Connected**, and the
  channel is `phoenix-figma`. If you use a custom channel, copy the config from **Setup** so the
  client uses the same channel, or call `join_channel` with that name.
- **MCP server missing:** check Node.js 24+, the absolute path in your MCP config, and the
  client's MCP logs; then reload the server.

Based on [cursor-talk-to-figma-mcp](https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp)
(MIT), adapted for Node.js.
