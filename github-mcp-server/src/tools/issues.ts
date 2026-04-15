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
  // list_issues
  server.tool(
    "list_issues",
    "List issues in a repository. Supports optional filters: state, labels and assignee.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      state: z.enum(["open", "closed", "all"]).default("open").describe("Issue state filter"),
      labels: z.string().optional().describe("Comma-separated list of label names"),
      assignee: z.string().optional().describe("Filter by assignee login"),
    },
    async ({ owner, repo, state, labels, assignee }) => {
      try {
        const { data } = await githubClient.issues.listForRepo({
          owner,
          repo,
          state,
          labels,
          assignee,
          per_page: 50,
        });
        // exclude pull requests from issues list
        const issues = data
          .filter((i) => !i.pull_request)
          .map((i) => ({
            number: i.number,
            title: i.title,
            state: i.state,
            user: i.user?.login,
            labels: i.labels.map((l) => (typeof l === "string" ? l : l.name)),
            created_at: i.created_at,
            html_url: i.html_url,
          }));
        return { content: [{ type: "text" as const, text: JSON.stringify(issues) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );

  // get_issue
  server.tool(
    "get_issue",
    "Get full details of a specific issue.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      issue_number: z.number().describe("Issue number"),
    },
    async ({ owner, repo, issue_number }) => {
      try {
        const { data } = await githubClient.issues.get({ owner, repo, issue_number });
        return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );

  // create_issue
  server.tool(
    "create_issue",
    "Create a new issue in a repository.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      title: z.string().describe("Issue title"),
      body: z.string().optional().describe("Issue body"),
      labels: z.array(z.string()).optional().describe("List of label names"),
      assignees: z.array(z.string()).optional().describe("List of assignee logins"),
    },
    async ({ owner, repo, title, body, labels, assignees }) => {
      try {
        const { data } = await githubClient.issues.create({ owner, repo, title, body, labels, assignees });
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

  // add_issue_comment
  server.tool(
    "add_issue_comment",
    "Add a comment to an issue or pull request.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      issue_number: z.number().describe("Issue or PR number"),
      body: z.string().describe("Comment text"),
    },
    async ({ owner, repo, issue_number, body }) => {
      try {
        const { data } = await githubClient.issues.createComment({ owner, repo, issue_number, body });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify({ id: data.id, html_url: data.html_url }) },
          ],
        };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );
}
