// Boots the MCP server over stdio, lists tools, and verifies the plugin-based
// tools (and comment stubs) are registered. Exits 0 on success.

import { startRelay, stopProcess, within } from "./test-utils.ts";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const relay = await startRelay();
const transport = new StdioClientTransport({
  command: "node",
  args: ["./src/server.ts"],
  env: { ...process.env, WS_PORT: String(relay.port) } as Record<string, string>,
});

const client = new Client({ name: "smoke", version: "1.0.0" });

try {
  await within(client.connect(transport));
  const { tools } = await within(client.listTools());
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

  if (missing.length) {
    throw new Error("Missing tools: " + missing.join(", "));
  }
  if (leaked.length) {
    throw new Error("REST tools still registered: " + leaked.join(", "));
  }
  console.log(
    `PASS: ${tools.length} plugin tools registered, REST tools removed. Sample:`,
    expected.join(", "),
  );
} finally {
  await client.close();
  await stopProcess(relay.child);
}
