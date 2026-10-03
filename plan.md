# Phoenix Figma MCP — plan

## Current state

- Node.js relay (`src/socket.ts`), stdio MCP server (`src/server.ts`) and Figma plugin
  (`src/plugin/code.ts`, `src/ui.html`).
- Port `3055`, channel `phoenix-figma`; the server joins automatically and reconnects.
- Plugin connection settings are saved. The Setup tab generates an MCP config with matching
  port and channel overrides.
- pnpm manages dependencies, builds and checks. Run `pnpm run verify` and
  `pnpm run format:check` before committing.

## Remaining work

- [ ] Check the plugin in Figma Desktop and FigJam with a real MCP client: selection, edits,
      exports, reconnects and saved settings.
- [ ] Show whether an MCP client is in the same channel. Currently, Connected confirms only
      the plugin's connection to the relay; peer roles/presence are not in the protocol.
- [ ] Decide whether a tray companion is needed. If approved, prototype relay start/stop and
      status before choosing a desktop framework or planning installers.

## Scope

The plugin panel must stay open. Reads and edits target its open file; closed files and Figma
comments are unsupported. Custom ports also need permission in `src/manifest.json`.
