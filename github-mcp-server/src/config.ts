import { z } from "zod";

const envSchema = z.object({
  GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN is required"),
  GITHUB_DEFAULT_OWNER: z.string().optional(),
});

function loadConfig() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const field = issue.path.join(".");
        return `  - ${field}: ${issue.message}`;
      })
      .join("\n");

    console.error(
      `[config] Failed to load configuration. Missing or invalid environment variables:\n${issues}\n` +
        `Please check your .env file or environment configuration.`
    );
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();
