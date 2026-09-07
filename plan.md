# Plan: Menubar Companion App

## Problems

1. The MCP requires the Figma plugin to be open in a separate window in Figma.

---

Always-on tray app that runs the relay, shows connection status, and guides setup. Replaces `npm run socket` and manual `join_channel`.

**Stack today:** relay (`src/socket.ts`) · MCP server (`src/server.ts`, Cursor) · Figma plugin (`src/manifest.json`, `src/ui.html`)

**Non-goals:** Can't auto-connect the Figma plugin (sandbox). Can't pick which file is open. Comments unsupported.

---

## Architecture

```
Menubar app (Tauri)
  → spawns node src/socket.ts
  → tray + status popover
  → optional observer on ws://localhost:3055

Relay :3055
  ← Figma plugin (user clicks Connect)
  ← MCP server (Cursor)
```

**Default channel fix (Phase 0):** Both sides use `cursor-figma` on port `3055`. Server auto-joins on connect/reconnect. Plugin defaults to same value (editable). `join_channel` stays for power users. Optional later: `~/.figma-mcp/state.json`.

**Status (Phase 2):** Relay up · plugin connected · MCP connected · channel match. Requires `hello`/`role` + `presence` in relay protocol.

**Tech:** Tauri (light shell, native tray). Relay stays Node as child process. Electron fallback if needed.

---

## Phases

| Phase  | What                                                                                                                                         |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **0a** | Hardcode `DEFAULT_CHANNEL` / `DEFAULT_PORT`. Server auto-joins in `on('open')`. Plugin defaults to same channel. Update README + smoke test. |
| **0b** | Optional `~/.figma-mcp/state.json` override (server reads; plugin shows value in UI).                                                        |
| **0c** | Fix stale `updateMcpConfig()` snippet in plugin UI.                                                                                          |
| **1**  | Tauri skeleton: tray, popover, spawn/restart relay, log output.                                                                              |
| **2**  | Live status checklist, copy buttons, tray color (green/amber/red).                                                                           |
| **3**  | First-run wizard: Cursor `mcp.json`, plugin import, test round-trip.                                                                         |
| **4**  | Settings, code-sign, DMG, optional auto-update.                                                                                              |

**Phase 0 tradeoffs:** Relay still manual. Shared channel can cross-talk on one machine (use custom channel to isolate). No relay auth on localhost.

---

## Milestones

- **M1:** Phase 0a — auto-join works without the app
- **M2:** Phases 1–2 — tray supervises relay + live status
- **M3:** Phase 3 — wizard for non-technical setup
- **M4:** Phase 4 — signed installable build

---

## Done when

Install app → wizard → Figma Connect → Cursor edits design. No terminal. Tray shows what's broken. Relay auto-restarts. No manual `join_channel` in the common case.
