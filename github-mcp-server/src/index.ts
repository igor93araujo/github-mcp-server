import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerTools as registerReposTools } from "./tools/repos.js";
import { registerTools as registerPullRequestsTools } from "./tools/pullRequests.js";
import { registerTools as registerIssuesTools } from "./tools/issues.js";
import { registerTools as registerReleasesTools } from "./tools/releases.js";
import { registerTools as registerSearchTools } from "./tools/search.js";

async function main(): Promise<void> {
  const server = new McpServer({
    name: "github-mcp",
    version: "1.0.0",
  });

  registerReposTools(server);
  registerPullRequestsTools(server);
  registerIssuesTools(server);
  registerReleasesTools(server);
  registerSearchTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[github-mcp] Fatal error: ${message}`);
  process.exit(1);
});
