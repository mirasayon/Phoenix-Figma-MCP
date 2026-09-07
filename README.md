# Figma MCP

A local Model Context Protocol server that connects Cursor (or any MCP client) to Figma through a **Figma plugin over a local WebSocket bridge** — no Figma REST API, no token, no rate limits.

- **Reads** — inspect the file currently open in Figma Desktop: document tree, selection, nodes, local components, styles, image exports.
- **Writes** — create/edit/delete nodes, set fills, auto-layout, components, text, and more.

Everything runs over the Figma Plugin API on the file you have open in **Figma Desktop**. Browser Figma is not supported.

Based on [`sonnylazuardi/cursor-talk-to-figma-mcp`](https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp) (MIT), ported to run entirely on **Node** (no Bun).

## Desktop only — not browser

| | Figma Desktop | Figma in browser |
|---|---|---|
| Import a local dev plugin | Yes | No |
| Connect to `ws://localhost:3055` | Yes | No |
| Read/write via Plugin API | Yes | No |
| Works with this MCP | **Yes** | **No** |

You need Figma Desktop because this workflow imports a **development plugin** from `manifest.json` and connects it to a relay running on your machine. Browser Figma cannot do either of those things.

## What must be running

A working session needs **three things** at once:

```
Terminal          Figma Desktop         Cursor
────────          ─────────────         ──────
relay running  +  file open        +  MCP server enabled
                  plugin connected
```

| Piece | How to start it |
|---|---|
| **Relay** | `npm run socket` in a terminal (keep it open) |
| **Figma file + plugin** | Open a file in Desktop, run the plugin, click Connect |
| **MCP server** | Started automatically by Cursor from `mcp.json` |

The plugin and the MCP server both default to the shared channel `cursor-figma`, so
there is **no manual `join_channel` step** in the common case. If any of the three
pieces above is missing, tools will hang or return connection errors.

## Quick start

### 1. Install

```bash
git clone <this-repo>
cd figma-mcp
npm install
```

### 2. Configure Cursor

Add to `~/.cursor/mcp.json`. Use an **absolute path** to `src/server.ts`:

```json
{
  "mcpServers": {
    "figma-mcp-mh": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/figma-mcp/src/server.ts"]
    }
  }
}
```

A project-scoped equivalent is in [`.mcp.json`](.mcp.json) (relative path — works when Cursor opens this repo as the workspace). No token or other env vars are required.

Restart Cursor (or reload MCP servers) after saving.

### 3. Start the relay

In a terminal, from the project root:

```bash
npm run socket
```

Listens on `ws://localhost:3055` by default. Override with `WS_PORT`.

Leave this terminal running for the whole session.

### 4. Import and run the Figma plugin

All of this happens in **Figma Desktop**:

1. Open the design file you want to work on.
2. **Plugins → Development → Import plugin from manifest…**
3. Select [`src/manifest.json`](src/manifest.json).
4. **Plugins → Development → figma mcp** to run it.
5. In the plugin panel, click **Connect** (leave the channel as the default `cursor-figma`).

Keep the plugin panel open and connected while you work.

### 5. Start using it

Once connected, ask Cursor to read or edit your open Figma file. Examples:

- "What's in my current Figma document?" → `get_document_info`
- "Read my current selection" → `read_my_design`
- "Create a 400×300 frame called Hero" → `create_frame`
- "Set the fill of node `1:234` to blue" → `set_fill_color`

All tools operate on **whatever file is open in Figma Desktop right now**.

## Architecture

```
Cursor (MCP host)
   stdio / JSON-RPC
MCP server  (src/server.ts, Node + tsx)
   WebSocket client  ->  Relay (src/socket.ts) <-> Figma plugin  (read + write the open file)
```

Three independent processes connect over `ws://localhost:3055`:

1. The **relay** ([`src/socket.ts`](src/socket.ts)) — a channel-based WebSocket broker. It does not understand Figma; it forwards messages between clients in the same named channel.
2. The **MCP server** ([`src/server.ts`](src/server.ts)) — connects to the relay as a WebSocket client and to Cursor over stdio. Each MCP tool maps to a `sendCommandToFigma(...)` call.
3. The **Figma plugin** ([`src/manifest.json`](src/manifest.json), [`code.js`](src/code.js), [`ui.html`](src/ui.html)) — the iframe UI (`ui.html`) owns the WebSocket (the plugin sandbox cannot), and relays commands to the main thread (`code.js`), which calls the Figma Plugin API.

The MCP server and plugin must be on the **same channel** or commands go nowhere. Both default to `cursor-figma` and the server auto-joins it on startup, so they line up automatically; use `join_channel` only to switch to a custom channel.

### How a command flows

```
Cursor calls create_frame
  → server.ts sends { command, params, id } over WebSocket
  → relay broadcasts to the plugin peer in the channel
  → ui.html → code.js → figma.createFrame(), etc.
  → result bubbles back with the same id
  → Cursor receives the tool result
```

Reads work the same way. The plugin calls `figma.getNodeByIdAsync()`, `node.exportAsync({ format: "JSON_REST_V1" })`, and similar — all local, no HTTP to Figma.

## Requirements

- Node.js 18+ (developed on Node 24). No Bun required.
- **Figma Desktop** with a file open.
- No Figma personal access token needed.

## Tools

All tools need the relay running and the plugin connected. The server auto-joins the default channel, so `join_channel` is only needed for a custom channel.

### Read tools

| Tool | Purpose |
|---|---|
| `get_document_info` | Current document/page overview |
| `get_selection` | Currently selected nodes |
| `get_node_info` / `get_nodes_info` | One or more nodes by ID |
| `read_my_design` | The current selection in detail |
| `get_local_components` | Components defined in the open file |
| `get_styles` | Color/text/effect/grid styles |
| `export_node_as_image` | Render a node to PNG (returns base64 image bytes) |

### Write tools

`create_frame`, `create_text`, `create_rectangle`, `set_fill_color`, `set_stroke_color`, `move_node`, `resize_node`, `clone_node`, `delete_node`, auto-layout (`set_layout_mode`, `set_padding`, `set_item_spacing`, ...), component instances, annotations, text scanning, and more — see [`src/server.ts`](src/server.ts).

### Comments (unsupported)

`get_figma_comments` and `post_figma_comment` are stubs only. Figma comments are exposed exclusively through the REST API, and the Plugin API has no access to them. Use Figma directly for comments.

## Troubleshooting

**Tools hang or time out**
- Is `npm run socket` still running?
- Does the plugin show "Connected"?
- Does the plugin's channel match the server's (both default to `cursor-figma`)? If you changed the channel in the plugin, call `join_channel` with that exact name.
- Is the plugin panel still open?

**"Not connected to Figma" / connection errors**
- Start the relay first, then connect the plugin.
- Check nothing else is blocking port 3055.

**MCP server not appearing in Cursor**
- Confirm `~/.cursor/mcp.json` uses an absolute path to `src/server.ts`.
- Restart Cursor or reload MCP servers.
- Check MCP logs in Cursor settings.

**Plugin not found in Figma**
- Re-import from manifest: **Plugins → Development → Import plugin from manifest…**
- Development plugins live under **Plugins → Development**, not the community list.

**Wrong or empty data**
- Switch to the correct file in Figma Desktop — reads only see the open file.
- There is no "read any file by URL/key" in this build.

**Smoke test after connecting**

1. `get_document_info` — should return your current page tree.
2. `create_frame` then `set_fill_color` — should create something visible on the canvas.

## Verify (developers)

```bash
npm run typecheck            # tsc --noEmit
node scripts/relay-smoke.mjs # relay request/response round-trip
node scripts/mcp-smoke.mjs   # boot server over stdio, list tools
```

For a full end-to-end check: start the relay, connect the plugin (default channel), then call `get_document_info` and `create_frame` followed by `set_fill_color`. No `join_channel` needed unless you changed the channel.

## Gotchas

- **stdio is sacred.** The MCP server must never write to stdout except JSON-RPC. It logs to stderr. The relay is a separate process, so its stdout logging is fine.
- **WebSocket lives in the plugin UI.** The Figma plugin sandbox has no `WebSocket`; the iframe (`ui.html`) owns the socket and relays to the main thread.
- **Channel mismatch = silence.** If write/read tools hang, confirm the plugin and the server are on the same channel (both default to `cursor-figma`) and the relay is running.
- **File must be open.** Reads and writes target the file open in Figma Desktop. You cannot read a closed or remote file by key without the REST API (removed in this build).
- **Comments are unavailable.** The Plugin API cannot access comments.

## Roadmap

The shared default channel (`cursor-figma`) already removes the manual `join_channel` step (Phase 0). An optional `~/.figma-mcp/state.json` (`{ "channel": "...", "port": ... }`) can override the channel/port; the server reads it on startup and falls back to the defaults if it's absent.

See [`plan.md`](plan.md) for a planned menubar companion app that would also auto-start the relay and show live connection status — removing the manual `npm run socket` step. That app does not exist yet; the flow above is the current setup.

## Credits

Write/read bridge and plugin: [`sonnylazuardi/cursor-talk-to-figma-mcp`](https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp) (MIT). Node port and plugin-only refactor applied here.
