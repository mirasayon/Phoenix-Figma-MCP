// Boots the MCP server over stdio, lists tools, and verifies the plugin-based
// tools (and comment stubs) are registered. Exits 0 on success.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["./src/server.ts"],
  env: { ...process.env } as Record<string, string>,
});

const client = new Client({ name: "smoke", version: "1.0.0" });

const timer = setTimeout(() => {
  console.error("FAIL: timed out");
  process.exit(1);
}, 20_000);

await client.connect(transport);
const { tools } = await client.listTools();
const names = tools.map((t) => t.name);

const expected = [
  "get_document_info",
  "get_node_info",
  "get_local_components",
  "get_styles",
  "export_node_as_image",
  "get_figma_comments",
  "post_figma_comment",
  "join_channel",
  "create_frame",
  "set_fill_color",
];
const missing = expected.filter((n) => !names.includes(n));

// REST tools must be gone (comment stubs are the only get_figma_*/post_figma_* left).
const forbidden = [
  "get_figma_file",
  "get_figma_nodes",
  "get_figma_components",
  "get_figma_styles",
  "get_figma_images",
  "figma_cache_stats",
  "figma_cache_clear",
];
const leaked = forbidden.filter((n) => names.includes(n));

clearTimeout(timer);
await client.close();

if (missing.length) {
  console.error("FAIL: missing tools:", missing.join(", "));
  process.exit(1);
}
if (leaked.length) {
  console.error("FAIL: REST tools still registered:", leaked.join(", "));
  process.exit(1);
}
console.log(
  `PASS: ${tools.length} plugin tools registered, REST tools removed. Sample:`,
  expected.join(", "),
);
process.exit(0);
