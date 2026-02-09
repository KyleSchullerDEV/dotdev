import { z } from "zod";

/**
 * Validates required environment variables at import time.
 * This fails fast with a clear error message instead of allowing
 * cryptic runtime failures deep in provider or API code.
 *
 * Usage: import { env } from "@/lib/env" anywhere you need env vars.
 *
 * NOTE: Only NEXT_PUBLIC_ prefixed variables are available client-side.
 * Server-only variables (WORKOS_API_KEY, etc.) are validated separately
 * in server contexts where they're needed.
 */

const clientEnvSchema = z.object({
  NEXT_PUBLIC_CONVEX_URL: z
    .string()
    .url("NEXT_PUBLIC_CONVEX_URL must be a valid URL (e.g. https://your-project.convex.cloud)"),
  NEXT_PUBLIC_WORKOS_REDIRECT_URI: z
    .string()
    .url(
      "NEXT_PUBLIC_WORKOS_REDIRECT_URI must be a valid URL (e.g. http://localhost:3000/callback)"
    ),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

function validateClientEnv() {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_WORKOS_REDIRECT_URI: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || undefined,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || undefined,
  });

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ✗ ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `\n\n❌ Invalid environment variables:\n${formatted}\n\nCheck your .env.local file against .env.example.\n`
    );
  }

  return result.data;
}

export const env = validateClientEnv();
