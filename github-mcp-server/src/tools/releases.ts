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
  // list_releases
  server.tool(
    "list_releases",
    "List releases for a repository.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
    },
    async ({ owner, repo }) => {
      try {
        const { data } = await githubClient.repos.listReleases({ owner, repo, per_page: 20 });
        const releases = data.map((r) => ({
          id: r.id,
          tag_name: r.tag_name,
          name: r.name,
          draft: r.draft,
          prerelease: r.prerelease,
          published_at: r.published_at,
          html_url: r.html_url,
        }));
        return { content: [{ type: "text" as const, text: JSON.stringify(releases) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );

  // get_latest_release
  server.tool(
    "get_latest_release",
    "Get the latest published release for a repository.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
    },
    async ({ owner, repo }) => {
      try {
        const { data } = await githubClient.repos.getLatestRelease({ owner, repo });
        return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
      } catch (err) {
        return errorResponse(err);
      }
    }
  );

  // create_release
  server.tool(
    "create_release",
    "Create a new release for a repository.",
    {
      owner: z.string().describe("Repository owner"),
      repo: z.string().describe("Repository name"),
      tag_name: z.string().describe("Tag name for the release"),
      name: z.string().optional().describe("Release name"),
      body: z.string().optional().describe("Release notes"),
      draft: z.boolean().optional().describe("Create as draft"),
      prerelease: z.boolean().optional().describe("Mark as pre-release"),
      target_commitish: z.string().optional().describe("Branch or commit SHA for the tag"),
    },
    async ({ owner, repo, tag_name, name, body, draft, prerelease, target_commitish }) => {
      try {
        const { data } = await githubClient.repos.createRelease({
          owner,
          repo,
          tag_name,
          name,
          body,
          draft,
          prerelease,
          target_commitish,
        });
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
