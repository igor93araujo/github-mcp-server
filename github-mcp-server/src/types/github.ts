/**
 * GitHub API type definitions
 */

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Repositories
// ---------------------------------------------------------------------------

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubUser;
  html_url: string;
  description?: string;
  default_branch: string;
  language?: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  clone_url: string;
  ssh_url: string;
}

// ---------------------------------------------------------------------------
// Contents / Files
// ---------------------------------------------------------------------------

export interface FileContent {
  type: "file" | "dir" | "symlink" | "submodule";
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  download_url?: string;
  content?: string;
  encoding?: string;
}

// ---------------------------------------------------------------------------
// Branches
// ---------------------------------------------------------------------------

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

// ---------------------------------------------------------------------------
// Commits
// ---------------------------------------------------------------------------

export interface CommitAuthor {
  name: string;
  email: string;
  date: string;
}

export interface Commit {
  sha: string;
  commit: {
    author: CommitAuthor;
    committer: CommitAuthor;
    message: string;
    url: string;
  };
  author?: GitHubUser;
  committer?: GitHubUser;
  html_url: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Pull Requests
// ---------------------------------------------------------------------------

export interface PullRequestRef {
  label: string;
  ref: string;
  sha: string;
  repo: Repository;
}

export interface PullRequest {
  number: number;
  title: string;
  body?: string;
  state: "open" | "closed";
  draft: boolean;
  user: GitHubUser;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  merged_at?: string;
  head: PullRequestRef;
  base: PullRequestRef;
  html_url: string;
  url: string;
  merged: boolean;
  mergeable?: boolean;
  requested_reviewers: GitHubUser[];
}

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

export interface Label {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface Issue {
  number: number;
  title: string;
  body?: string;
  state: "open" | "closed";
  user: GitHubUser;
  labels: Label[];
  assignees: GitHubUser[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
  html_url: string;
  url: string;
  pull_request?: { url: string };
}

// ---------------------------------------------------------------------------
// Releases
// ---------------------------------------------------------------------------

export interface Release {
  id: number;
  tag_name: string;
  name?: string;
  body?: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at?: string;
  author: GitHubUser;
  html_url: string;
  tarball_url: string;
  zipball_url: string;
}
