import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { githubClient } from "../githubClient.js";
import type { Repository } from "../types/github.js";

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
  // get_repository
  server.tool(
    "get_repository",
    "Get full details of a specific GitHub repository.",
    {
      owner: z.string().describe("Repository owner (user or org)"),
      repo: z.string().describe("Repository name"),
    },
    async ({ owner, repo }) => {
      try {
        const { data } = await githubClient.repos.get({ owner, repo });
        const result: Partial<Repository> = {
          id: data.id,
          name: data.name,
          full_name: data.full_name,
          private: data.private,
          description: data.description ?? undefined,
          default_branch: data.default_branch,
          language: data.language ?? undefined,
          stargazers_count: data.stargazers_count,
          forks_count: data.forks_count,
          open_issues_count: data.open_issues_count,
          html_url: data.html_url,
          clone_url: data.clone_url,
          ssh_url: data.ssh_url,
        };
        return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );

  // list_branches
  server.tool(
    "list_branches",
    "List all branches of a repository.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
    },
    async ({ owner, repo }) => {
      try {
        const { data } = await githubClient.repos.listBranches({ owner, repo, per_page: 100 });
        const branches = data.map((b) => ({
          name: b.name,
          sha: b.commit.sha,
          protected: b.protected,
        }));
        return { content: [{ type: "text" as const, text: JSON.stringify(branches) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );

  // list_commits
  server.tool(
    "list_commits",
    "List commits in a repository. Supports optional filters: branch, author, since and until.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      branch: z.string().optional().describe("Branch name (default: default branch)"),
      author: z.string().optional().describe("Filter by author login or email"),
      since: z.string().optional().describe("ISO 8601 start date"),
      until: z.string().optional().describe("ISO 8601 end date"),
    },
    async ({ owner, repo, branch, author, since, until }) => {
      try {
        const { data } = await githubClient.repos.listCommits({
          owner,
          repo,
          sha: branch,
          author,
          since,
          until,
          per_page: 50,
        });
        const commits = data.map((c) => ({
          sha: c.sha,
          message: c.commit.message,
          author: c.commit.author,
          html_url: c.html_url,
        }));
        return { content: [{ type: "text" as const, text: JSON.stringify(commits) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );

  // get_file_content
  server.tool(
    "get_file_content",
    "Get the content of a file from a repository. Optionally specify a branch or commit ref.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      path: z.string().describe("File path within the repository"),
      ref: z.string().optional().describe("Branch, tag or commit SHA"),
    },
    async ({ owner, repo, path, ref }) => {
      try {
        const { data } = await githubClient.repos.getContent({ owner, repo, path, ref });
        if (Array.isArray(data)) {
          const items = data.map((i) => `${i.type}: ${i.path}`);
          return { content: [{ type: "text" as const, text: items.join("\n") }] };
        }
        const file = data as { type: string; content?: string; encoding?: string; path: string };
        if (file.type === "file" && file.content && file.encoding === "base64") {
          const content = Buffer.from(file.content, "base64").toString("utf-8");
          return { content: [{ type: "text" as const, text: content }] };
        }
        return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );

  // list_directory
  server.tool(
    "list_directory",
    "List files and folders in a directory of a repository.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      path: z.string().default("").describe("Directory path (empty for root)"),
      ref: z.string().optional().describe("Branch, tag or commit SHA"),
    },
    async ({ owner, repo, path, ref }) => {
      try {
        const { data } = await githubClient.repos.getContent({ owner, repo, path, ref });
        if (!Array.isArray(data)) {
          return { content: [{ type: "text" as const, text: "Path is a file, not a directory." }] };
        }
        const items = data.map((i) => ({ type: i.type, name: i.name, path: i.path, size: i.size }));
        return { content: [{ type: "text" as const, text: JSON.stringify(items) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );
}
