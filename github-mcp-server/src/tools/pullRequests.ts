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
  // list_pull_requests
  server.tool(
    "list_pull_requests",
    "List pull requests in a repository. Supports optional filters: state, head branch and base branch.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      state: z.enum(["open", "closed", "all"]).default("open").describe("PR state filter"),
      head: z.string().optional().describe("Filter by head branch (user:branch format)"),
      base: z.string().optional().describe("Filter by base branch"),
    },
    async ({ owner, repo, state, head, base }) => {
      try {
        const { data } = await githubClient.pulls.list({ owner, repo, state, head, base, per_page: 50 });
        const prs = data.map((pr) => ({
          number: pr.number,
          title: pr.title,
          state: pr.state,
          draft: pr.draft,
          user: pr.user?.login,
          created_at: pr.created_at,
          head: pr.head.ref,
          base: pr.base.ref,
          html_url: pr.html_url,
        }));
        return { content: [{ type: "text" as const, text: JSON.stringify(prs) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );

  // get_pull_request
  server.tool(
    "get_pull_request",
    "Get full details of a specific pull request.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      pull_number: z.number().describe("Pull request number"),
    },
    async ({ owner, repo, pull_number }) => {
      try {
        const { data } = await githubClient.pulls.get({ owner, repo, pull_number });
        return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );

  // create_pull_request
  server.tool(
    "create_pull_request",
    "Create a new pull request.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      title: z.string().describe("Pull request title"),
      head: z.string().describe("Source branch name"),
      base: z.string().describe("Target branch name"),
      body: z.string().optional().describe("Pull request description"),
      draft: z.boolean().optional().describe("Create as draft PR"),
    },
    async ({ owner, repo, title, head, base, body, draft }) => {
      try {
        const { data } = await githubClient.pulls.create({ owner, repo, title, head, base, body, draft });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify({ number: data.number, html_url: data.html_url }) },
          ],
        };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );

  // list_pr_reviews
  server.tool(
    "list_pr_reviews",
    "List reviews for a pull request.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      pull_number: z.number().describe("Pull request number"),
    },
    async ({ owner, repo, pull_number }) => {
      try {
        const { data } = await githubClient.pulls.listReviews({ owner, repo, pull_number });
        const reviews = data.map((r) => ({
          id: r.id,
          user: r.user?.login,
          state: r.state,
          submitted_at: r.submitted_at,
          body: r.body,
        }));
        return { content: [{ type: "text" as const, text: JSON.stringify(reviews) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );
}
