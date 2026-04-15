import { Octokit } from "@octokit/rest";
import { config } from "./config.js";

const githubClient = new Octokit({
  auth: config.GITHUB_TOKEN,
  log: {
    debug: () => {},
    info: (msg: string) =>
      console.error(JSON.stringify({ level: "info", msg })),
    warn: (msg: string) =>
      console.error(JSON.stringify({ level: "warn", msg })),
    error: (msg: string) =>
      console.error(JSON.stringify({ level: "error", msg })),
  },
});

export { githubClient };
