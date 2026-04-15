import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { githubClient } from "../githubClient.js";

function errorResponse(err: unknown): {
  content: [{ type: "text"; text: string }];
  isError: true;
} {
  const error = err as Error & { status?: number };
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ error: error.message, statusCode: error.status ?? 500 }),
      },
    ],
    isError: true,
  };
}

export function registerTools(server: McpServer): void {
  // search_code
  server.tool(
    "search_code",
    "Search for code across GitHub repositories.",
    {
      query: z.string().describe("Search query (supports GitHub code search syntax)"),
      owner: z.string().optional().describe("Restrict search to a specific owner"),
      repo: z.string().optional().describe("Restrict search to a specific repo (requires owner)"),
    },
    async ({ query, owner, repo }) => {
      try {
        let q = query;
        if (owner && repo) q += ` repo:${owner}/${repo}`;
        else if (owner) q += ` user:${owner}`;

        const { data } = await githubClient.search.code({ q, per_page: 30 });
        const items = data.items.map((i) => ({
          name: i.name,
          path: i.path,
          repository: i.repository.full_name,
          html_url: i.html_url,
        }));
        return { content: [{ type: "text" as const, text: JSON.stringify({ total: data.total_count, items }) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );

  // search_repositories
  server.tool(
    "search_repositories",
    "Search for repositories on GitHub.",
    {
      query: z.string().describe("Search query (supports GitHub repository search syntax)"),
      sort: z
        .enum(["stars", "forks", "help-wanted-issues", "updated"])
        .optional()
        .describe("Sort field"),
      order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    },
    async ({ query, sort, order }) => {
      try {
        const { data } = await githubClient.search.repos({ q: query, sort, order, per_page: 20 });
        const items = data.items.map((r) => ({
          full_name: r.full_name,
          description: r.description,
          stars: r.stargazers_count,
          language: r.language,
          html_url: r.html_url,
        }));
        return { content: [{ type: "text" as const, text: JSON.stringify({ total: data.total_count, items }) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );

  // search_issues
  server.tool(
    "search_issues",
    "Search for issues and pull requests on GitHub.",
    {
      query: z.string().describe("Search query (supports GitHub issue search syntax)"),
      owner: z.string().optional().describe("Restrict search to a specific owner"),
      repo: z.string().optional().describe("Restrict search to a specific repo (requires owner)"),
    },
    async ({ query, owner, repo }) => {
      try {
        let q = query;
        if (owner && repo) q += ` repo:${owner}/${repo}`;
        else if (owner) q += ` user:${owner}`;

        const { data } = await githubClient.search.issuesAndPullRequests({ q, per_page: 30 });
        const items = data.items.map((i) => ({
          number: i.number,
          title: i.title,
          state: i.state,
          user: i.user?.login,
          html_url: i.html_url,
          pull_request: !!i.pull_request,
        }));
        return { content: [{ type: "text" as const, text: JSON.stringify({ total: data.total_count, items }) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );
}
