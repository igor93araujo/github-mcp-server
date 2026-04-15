# github-mcp-server

MCP Server for GitHub integration. Exposes GitHub API operations as tools consumable by AI assistants via the [Model Context Protocol](https://modelcontextprotocol.io).

## Requirements

- Node.js >= 20
- GitHub Personal Access Token (classic) with `repo` scope

## Setup

```bash
npm install
npm run build
```

Create a `.env` file based on `.env.example`:

```bash
GITHUB_TOKEN=ghp_your_token_here
```

## Configuration (Kiro / MCP client)

Add to `~/.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["/absolute/path/to/github-mcp-server/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      },
      "disabled": false,
      "autoApprove": [
        "get_repository",
        "list_branches",
        "list_commits",
        "get_file_content",
        "list_directory",
        "list_pull_requests",
        "get_pull_request",
        "list_issues",
        "get_issue",
        "list_releases",
        "get_latest_release",
        "search_code",
        "search_repositories",
        "search_issues"
      ]
    }
  }
}
```

> Use a **classic token** with `repo` scope. Fine-grained tokens do not support the search API.

## Available Tools

### Repositories

| Tool | Description |
|---|---|
| `get_repository` | Get full details of a repository |
| `list_branches` | List all branches |
| `list_commits` | List commits with optional filters (branch, author, since, until) |
| `get_file_content` | Get raw content of a file (optionally by branch/ref) |
| `list_directory` | List files and folders in a directory |

### Pull Requests

| Tool | Description |
|---|---|
| `list_pull_requests` | List PRs with optional filters (state, head, base) |
| `get_pull_request` | Get full details of a specific PR |
| `create_pull_request` | Create a new PR |
| `list_pr_reviews` | List reviews for a PR |

### Issues

| Tool | Description |
|---|---|
| `list_issues` | List issues with optional filters (state, labels, assignee) |
| `get_issue` | Get full details of a specific issue |
| `create_issue` | Create a new issue |
| `add_issue_comment` | Add a comment to an issue or PR |

### Releases

| Tool | Description |
|---|---|
| `list_releases` | List releases for a repository |
| `get_latest_release` | Get the latest published release |
| `create_release` | Create a new release |

### Search

| Tool | Description |
|---|---|
| `search_code` | Search for code across repositories |
| `search_repositories` | Search for repositories |
| `search_issues` | Search for issues and pull requests |

## Project Structure

```
src/
├── index.ts          # Entry point
├── config.ts         # Env var validation (zod)
├── githubClient.ts   # Octokit instance
├── types/
│   └── github.ts     # TypeScript type definitions
└── tools/
    ├── repos.ts
    ├── pullRequests.ts
    ├── issues.ts
    ├── releases.ts
    └── search.ts
```

## Scripts

```bash
npm run build    # Compile to dist/
npm run lint     # ESLint
npm run format   # Prettier
```
