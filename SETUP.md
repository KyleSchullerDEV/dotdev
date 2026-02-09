# Setup Guide: kyleschuller.dev

A step-by-step guide to spinning up the blog from zero to working authentication. This covers Phases 1 and 2 of the roadmap.

---

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 20+ installed (`node --version`)
- [ ] npm 10+ installed (`npm --version`)
- [ ] Git installed and configured (`git --version`)
- [ ] GitHub account
- [ ] Vercel account (free tier is fine)
- [ ] WorkOS account (free tier, create at [workos.com/sign-up](https://signin.workos.com/sign-up))

---

## Part 1: Repository Setup

### Step 1.1: Create the Next.js Project

```bash
npx create-next-app@latest kyleschuller-dev --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

When prompted:

- Would you like to use Turbopack? → **No** (stable is fine for now)

```bash
cd kyleschuller-dev
```

> **Note**: As of Next.js 15.2+, `create-next-app` scaffolds with **Tailwind CSS v4** and **ESLint flat config** (`eslint.config.mjs`) by default. The instructions in this guide are written for these defaults. If you see a `tailwind.config.js` or `.eslintrc.json` file after scaffolding, you're on an older version — update `create-next-app` first.

### Step 1.2: Verify It Works

```bash
npm run dev
```

Visit `http://localhost:3000`. You should see the Next.js welcome page. Stop the server with `Ctrl+C`.

### Step 1.3: Clean Up Boilerplate

Delete the default content:

```bash
rm -rf src/app/favicon.ico
```

Replace `src/app/page.tsx`:

```tsx
// src/app/page.tsx

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">kyleschuller.dev</h1>
      <p className="mt-4 text-gray-600">Coming soon.</p>
    </main>
  );
}
```

Replace `src/app/layout.tsx`:

```tsx
// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kyle Schuller | Frontend Engineer",
  description: "Personal blog and portfolio of Kyle Schuller, Frontend Engineer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
```

Replace `src/app/globals.css` (Tailwind v4 syntax — no `@tailwind` directives):

```css
/* src/app/globals.css */

@import "tailwindcss";
```

### Step 1.4: Configure TypeScript Strict Mode

Update your `tsconfig.json`. Next.js 15 generates a reasonable base config — add these stricter options to `compilerOptions`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Run typecheck to verify:

```bash
npx tsc --noEmit
```

Should complete with no errors.

---

## Part 2: Code Quality Tooling

### Step 2.1: Configure ESLint (Flat Config)

Next.js 15 generates an `eslint.config.mjs` file. Replace its contents with:

```js
// eslint.config.mjs

import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "prefer-const": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];

export default eslintConfig;
```

### Step 2.2: Install and Configure Prettier

```bash
npm install --save-dev prettier eslint-config-prettier prettier-plugin-tailwindcss
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Create `.prettierignore`:

```
node_modules
.next
.vercel
pnpm-lock.yaml
package-lock.json
```

### Step 2.3: Add npm Scripts

Update your `package.json` scripts section:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Step 2.4: Set Up Husky and lint-staged

```bash
npm install --save-dev husky lint-staged
npx husky init
```

This creates a `.husky` folder. Replace `.husky/pre-commit` with:

```bash
npx lint-staged
```

Create `.lintstagedrc.json`:

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

### Step 2.5: Verify Everything Works

```bash
# Should pass
npm run lint

# Should pass
npm run typecheck

# Should format files
npm run format

# Test a commit
git add .
git commit -m "chore: initial project setup with tooling"
```

If the commit succeeds, Husky and lint-staged are working.

---

## Part 3: Testing Setup

### Step 3.1: Install Vitest and Testing Library

```bash
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @types/react
```

### Step 3.2: Configure Vitest

Create `vitest.config.ts` in the project root:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Step 3.3: Create Test Setup File

Create the directory and setup file:

```bash
mkdir -p src/test
```

Create `src/test/setup.ts`:

```typescript
import "@testing-library/jest-dom";
```

### Step 3.4: Write Your First Test

Create `src/lib/utils.ts`:

```typescript
/**
 * Generates a URL-friendly slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Formats a date for display.
 */
export function formatDate(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
```

Create `src/lib/utils.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { slugify, formatDate } from "./utils";

describe("slugify", () => {
  it("converts text to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("my blog post")).toBe("my-blog-post");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! How are you?")).toBe("hello-how-are-you");
  });

  it("handles multiple spaces and hyphens", () => {
    expect(slugify("too   many   spaces")).toBe("too-many-spaces");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  hello world  ")).toBe("hello-world");
  });

  it("handles empty strings", () => {
    expect(slugify("")).toBe("");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const date = new Date("2025-01-15");
    expect(formatDate(date)).toBe("15 January 2025");
  });

  it("formats a timestamp", () => {
    const timestamp = new Date("2025-06-01").getTime();
    expect(formatDate(timestamp)).toBe("1 June 2025");
  });
});
```

### Step 3.5: Run Tests

```bash
npm run test
```

You should see all tests passing.

---

## Part 4: GitHub Repository & CI

### Step 4.1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `kyleschuller-dev`
3. Description: "Personal blog and portfolio"
4. **Private** (you can make it public later)
5. Don't initialise with README (you already have files)
6. Click **Create repository**

### Step 4.2: Push Your Code

```bash
git remote add origin git@github.com:YOUR_USERNAME/kyleschuller-dev.git
git branch -M main
git push -u origin main
```

### Step 4.3: Create GitHub Actions CI Workflow

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run tests
        run: npm run test

      - name: Check formatting
        run: npm run format:check

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: quality
    env:
      # Convex generates types at build time that reference the deployment URL.
      # In CI we don't have a real deployment, so we provide a dummy value
      # to let the build complete. Auth validation and runtime calls are
      # unaffected — this only satisfies the type-level import.
      NEXT_PUBLIC_CONVEX_URL: "https://placeholder.convex.cloud"

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
```

> **Note on Convex + CI builds**: The `build` job sets a dummy `NEXT_PUBLIC_CONVEX_URL` environment variable. Without this, `npm run build` will fail because Next.js tries to resolve the Convex URL at build time. This is safe — the dummy value is only used during the CI build step, not at runtime.

### Step 4.4: Commit and Push

```bash
git add .
git commit -m "ci: add GitHub Actions workflow"
git push
```

Go to your GitHub repository → Actions tab. You should see the workflow running.

---

## Part 5: Environment Variables

### Step 5.1: Create the Template

Create `.env.example` in the project root:

```bash
# =============================================================================
# kyleschuller.dev — Environment Variables
# =============================================================================
# Copy this file to .env.local and fill in the values.
# Never commit .env.local to version control.
# =============================================================================

# Convex
# Generated automatically by `npx convex dev` on first run.
NEXT_PUBLIC_CONVEX_URL=

# WorkOS AuthKit
# Find these at https://dashboard.workos.com/api-keys
WORKOS_CLIENT_ID=client_XXXXXXXXXXXXXXXX
WORKOS_API_KEY=sk_test_XXXXXXXXXXXXXXXX

# Generate with: openssl rand -base64 32
WORKOS_COOKIE_PASSWORD=

# Must match the redirect URI configured in your WorkOS Dashboard
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback
```

Verify `.env.local` is in your `.gitignore` (it should be by default from `create-next-app`).

### Step 5.2: Create Environment Validation Module

Install Zod:

```bash
npm install zod
```

Create `src/lib/env.ts`:

```typescript
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
});

function validateClientEnv() {
  const result = clientEnvSchema.safeParse({
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_WORKOS_REDIRECT_URI: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI,
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
```

```bash
git add .env.example src/lib/env.ts
git commit -m "docs: add .env.example with required variables and Zod validation"
```

---

## Part 6: Convex Setup

### Step 6.1: Install Convex

```bash
npm install convex
```

### Step 6.2: Initialise Convex

```bash
npx convex dev
```

This will:

1. Prompt you to log in to Convex (opens browser)
2. Ask you to create a new project or link existing
3. Create a `convex/` folder in your project
4. Generate `.env.local` with your Convex URL

When prompted for project name, use: `kyleschuller-dev`

Keep this terminal running — it watches for changes.

### Step 6.3: Define Your Schema

Create `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    body: v.string(),
    excerpt: v.string(),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    publishedAt: v.optional(v.number()),
    firstPublishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    authorId: v.id("users"),
    tags: v.optional(v.array(v.string())),
    coverImage: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_status_date", ["status", "publishedAt"])
    .index("by_author", ["authorId", "createdAt"]),

  users: defineTable({
    workosId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workos_id", ["workosId"])
    .index("by_email", ["email"]),

  post_revisions: defineTable({
    postId: v.id("posts"),
    title: v.string(),
    body: v.string(),
    excerpt: v.string(),
    tags: v.optional(v.array(v.string())),
    coverImage: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    savedAt: v.number(),
    savedBy: v.id("users"),
  }).index("by_post", ["postId", "savedAt"]),
});
```

The `npx convex dev` terminal should show the schema being synced.

### Step 6.4: Create Auth Helper

Create `convex/lib/auth.ts`:

```typescript
import { QueryCtx, MutationCtx } from "../_generated/server";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_id", (q) => q.eq("workosId", identity.subject))
    .unique();

  return user;
}

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireAuth(ctx);
  if (user.role !== "admin") {
    throw new Error("Not authorised: admin role required");
  }
  return user;
}
```

### Step 6.5: Create User Functions

Create `convex/users.ts`:

```typescript
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const syncFromWorkOS = mutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Validate that the authenticated user's JWT identity matches
    // the workosId being synced. This prevents a user from creating or
    // modifying records for a different WorkOS user.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    if (identity.subject !== args.workosId) {
      throw new Error("Identity mismatch: cannot sync a different user");
    }

    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .unique();

    if (existing) {
      // Update existing user's info
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new user.
    // First user becomes admin, everyone else is a regular user.
    //
    // NOTE: This is a known simplification for a single-author blog.
    // For multi-user production systems, seed admin via a setup script.
    //
    // SAFETY: This read-then-write pattern (check user count, then insert)
    // is safe from TOCTOU race conditions because Convex mutations are
    // fully serialised and transactional. Two concurrent syncFromWorkOS
    // calls will execute sequentially, not interleave. In a traditional
    // SQL database, this would require a transaction with serializable
    // isolation — here it's guaranteed by the runtime.
    const existingUsers = await ctx.db.query("users").collect();
    const role = existingUsers.length === 0 ? "admin" : "user";

    const now = Date.now();
    return await ctx.db.insert("users", {
      workosId: args.workosId,
      email: args.email,
      name: args.name,
      role,
      createdAt: now,
      updatedAt: now,
    });
  },
});
```

### Step 6.6: Create Post Functions

Create `convex/posts.ts`:

```typescript
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { requireAdmin, getCurrentUser } from "./lib/auth";

// ============================================================================
// PUBLIC QUERIES
// ============================================================================

export const getPublished = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    // Use pagination from day one to avoid loading all posts into memory.
    // The usePaginatedQuery hook on the client handles cursor management.
    //
    // Index ordering note: The "by_status_date" index is ["status", "publishedAt"].
    // After filtering to status === "published", .order("desc") reverses the
    // remaining index dimension, giving us posts sorted by publishedAt descending.
    // This is NOT ordering by _creationTime — it's ordering by the second field
    // in the compound index.
    return await ctx.db
      .query("posts")
      .withIndex("by_status_date", (q) => q.eq("status", "published"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    // Only return if published, unless user is admin
    if (!post) {
      return null;
    }

    if (post.status !== "published") {
      const user = await getCurrentUser(ctx);
      if (!user || user.role !== "admin") {
        return null;
      }
    }

    // Join author name so the client doesn't need a separate query
    const author = await ctx.db.get(post.authorId);

    return { ...post, authorName: author?.name ?? null };
  },
});

// ============================================================================
// ADMIN QUERIES
// ============================================================================

export const getAll = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Orders by _creationTime descending (Convex default when no index specified).
    // For an admin view, this shows the most recently created posts first.
    // Consider switching to an updatedAt-based index if recently edited drafts
    // need to float to the top.
    return await ctx.db.query("posts").order("desc").paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return await ctx.db.get(args.id);
  },
});

// ============================================================================
// ADMIN MUTATIONS
// ============================================================================

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    body: v.string(),
    excerpt: v.string(),
    tags: v.optional(v.array(v.string())),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);

    // Check slug uniqueness
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      throw new Error(`A post with slug "${args.slug}" already exists`);
    }

    const now = Date.now();

    return await ctx.db.insert("posts", {
      title: args.title,
      slug: args.slug,
      body: args.body,
      excerpt: args.excerpt,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      authorId: user._id,
      tags: args.tags,
      coverImage: args.coverImage,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.string(),
    slug: v.string(),
    body: v.string(),
    excerpt: v.string(),
    tags: v.optional(v.array(v.string())),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);

    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }

    // Check slug uniqueness (excluding current post)
    if (args.slug !== post.slug) {
      // Prevent slug changes on previously published posts to protect URLs
      if (post.firstPublishedAt) {
        throw new Error("Cannot change slug of a previously published post");
      }

      const existing = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .unique();

      if (existing) {
        throw new Error(`A post with slug "${args.slug}" already exists`);
      }
    }

    // REVISION STRATEGY: Snapshot the CURRENT (pre-edit) state of the post.
    // This creates an audit trail of "what the post looked like before this edit"
    // rather than "what it was changed to." The current post document always
    // represents the latest state; the revision table is the history of
    // previous states.
    //
    // Implication for Phase 8 "restore previous version": restoring means
    // copying a revision's fields onto the current post (and creating a new
    // revision of the pre-restore state). See ADR-006.
    await ctx.db.insert("post_revisions", {
      postId: args.id,
      title: post.title,
      body: post.body,
      excerpt: post.excerpt,
      tags: post.tags,
      coverImage: post.coverImage,
      status: post.status,
      savedAt: Date.now(),
      savedBy: user._id,
    });

    // Update the post
    await ctx.db.patch(args.id, {
      title: args.title,
      slug: args.slug,
      body: args.body,
      excerpt: args.excerpt,
      tags: args.tags,
      coverImage: args.coverImage,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }

    // Delete all revisions first
    const revisions = await ctx.db
      .query("post_revisions")
      .withIndex("by_post", (q) => q.eq("postId", args.id))
      .collect();

    for (const revision of revisions) {
      await ctx.db.delete(revision._id);
    }

    // Delete the post
    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("posts"),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }

    const now = Date.now();

    await ctx.db.patch(args.id, {
      status: args.status,
      // publishedAt reflects the most recent publish action
      publishedAt: args.status === "published" ? now : post.publishedAt,
      // firstPublishedAt is set once and never cleared
      ...(args.status === "published" && !post.firstPublishedAt ? { firstPublishedAt: now } : {}),
      updatedAt: now,
    });

    return { status: args.status };
  },
});
```

### Step 6.7: Add Convex Provider to App

Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kyle Schuller | Frontend Engineer",
  description: "Personal blog and portfolio of Kyle Schuller, Frontend Engineer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
```

Create the provider (we'll add auth later):

```bash
mkdir -p src/components/providers
```

Create `src/components/providers/ConvexClientProvider.tsx`:

```tsx
"use client";

import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { env } from "@/lib/env";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ErrorBoundary>
  );
}
```

### Step 6.8: Create Error Boundary

Create `src/components/ErrorBoundary.tsx`:

```tsx
"use client";

import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Minimal error boundary to prevent full-page crashes when Convex
 * is unreachable or providers fail. This will be replaced with a
 * more polished version in Phase 5 (global error handling).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="mt-4 text-gray-600">
              Please try refreshing the page. If the problem persists, check your network
              connection.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Try again
            </button>
          </main>
        )
      );
    }

    return this.props.children;
  }
}
```

### Step 6.9: Verify Convex Connection

Update `src/app/page.tsx` temporarily to test:

```tsx
"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const { results: posts, status } = usePaginatedQuery(
    api.posts.getPublished,
    {},
    { initialNumItems: 10 }
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">kyleschuller.dev</h1>
      <p className="mt-4 text-gray-600">
        {status === "LoadingFirstPage" ? "Loading..." : `${posts.length} published posts`}
      </p>
    </main>
  );
}
```

Run the dev server:

```bash
npm run dev
```

You should see "0 published posts" (not "Loading..." stuck forever). This confirms Convex is connected.

### Step 6.10: Commit Phase 1

```bash
git add .
git commit -m "feat: complete Phase 1 — foundation with Convex data layer"
git push
```

---

## Part 7: WorkOS Authentication (Phase 2)

### Step 7.1: Create WorkOS Account and Configure AuthKit

1. Go to [workos.com/sign-up](https://signin.workos.com/sign-up) and create an account
2. In the WorkOS Dashboard, navigate to **Authentication** → **AuthKit**
3. Click **Set up AuthKit**
4. Select **Use AuthKit's customizable hosted UI**
5. Complete the setup wizard:
   - Choose your authentication methods (email + password is fine to start)
   - For **Redirect URI**, enter: `http://localhost:3000/callback`
   - Complete the remaining steps

### Step 7.2: Configure CORS

1. In WorkOS Dashboard, go to **Authentication** → **Sessions**
2. Find **Cross-Origin Resource Sharing (CORS)** and click **Manage**
3. Add `http://localhost:3000`
4. Save

### Step 7.3: Get Your Credentials

1. In WorkOS Dashboard, go to **API Keys**
2. Copy your:
   - **Client ID** (starts with `client_`)
   - **Secret Key** (starts with `sk_test_`)

### Step 7.4: Install WorkOS Packages

```bash
npm install @workos-inc/authkit-nextjs @convex-dev/workos
```

### Step 7.5: Configure Environment Variables

Update your `.env.local`:

```bash
# Convex (already present)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# WorkOS AuthKit
WORKOS_CLIENT_ID=client_XXXXXXXXXXXXXXXX
WORKOS_API_KEY=sk_test_XXXXXXXXXXXXXXXX
WORKOS_COOKIE_PASSWORD=generate_a_random_32_char_string_here
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/callback
```

Generate a secure cookie password:

```bash
openssl rand -base64 32
```

Copy the output and use it for `WORKOS_COOKIE_PASSWORD`.

### Step 7.6: Configure Convex Auth

Create `convex/auth.config.ts`:

```typescript
const clientId = process.env.WORKOS_CLIENT_ID;

const authConfig = {
  providers: [
    {
      type: "customJwt" as const,
      issuer: `https://api.workos.com/`,
      algorithm: "RS256" as const,
      applicationID: clientId,
      jwks: `https://api.workos.com/sso/jwks/${clientId}`,
    },
    {
      type: "customJwt" as const,
      issuer: `https://api.workos.com/user_management/${clientId}`,
      algorithm: "RS256" as const,
      jwks: `https://api.workos.com/sso/jwks/${clientId}`,
    },
  ],
};

export default authConfig;
```

### Step 7.7: Set Convex Environment Variable

The `npx convex dev` terminal will show an error about missing `WORKOS_CLIENT_ID`.

1. Go to the Convex dashboard (link shown in terminal)
2. Navigate to your project → **Settings** → **Environment Variables**
3. Add `WORKOS_CLIENT_ID` with your client ID value
4. Save

The `npx convex dev` terminal should now show "Convex functions ready."

### Step 7.8: Create Auth Middleware

Create `src/middleware.ts`:

```typescript
import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ["/", "/blog", "/blog/(.*)", "/contact", "/sign-in", "/sign-up"],
  },
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

### Step 7.9: Create Auth Routes

Create the callback route:

```bash
mkdir -p src/app/callback
```

Create `src/app/callback/route.ts`:

```typescript
import { handleAuth } from "@workos-inc/authkit-nextjs";

export const GET = handleAuth();
```

Create the sign-in route:

```bash
mkdir -p src/app/sign-in
```

Create `src/app/sign-in/route.ts`:

```typescript
import { redirect } from "next/navigation";
import { getSignInUrl } from "@workos-inc/authkit-nextjs";

export async function GET() {
  const authorizationUrl = await getSignInUrl();
  return redirect(authorizationUrl);
}
```

Create the sign-up route:

```bash
mkdir -p src/app/sign-up
```

Create `src/app/sign-up/route.ts`:

```typescript
import { redirect } from "next/navigation";
import { getSignUpUrl } from "@workos-inc/authkit-nextjs";

export async function GET() {
  const authorizationUrl = await getSignUpUrl();
  return redirect(authorizationUrl);
}
```

### Step 7.10: Update Convex Provider with Auth

Replace `src/components/providers/ConvexClientProvider.tsx`:

```tsx
"use client";

import { ReactNode, useCallback, useRef } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import { AuthKitProvider, useAuth, useAccessToken } from "@workos-inc/authkit-nextjs/components";
import { UserSync } from "./UserSync";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { env } from "@/lib/env";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthKitProvider>
        <ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuthKit}>
          <UserSync>{children}</UserSync>
        </ConvexProviderWithAuth>
      </AuthKitProvider>
    </ErrorBoundary>
  );
}

/**
 * Bridges WorkOS AuthKit's auth state into the shape Convex expects.
 *
 * NOTE: This uses ConvexProviderWithAuth (generic) rather than
 * ConvexProviderWithAuthKit from @convex-dev/workos. The official Convex
 * docs show both patterns. We use the generic provider because our custom
 * useAuthFromAuthKit hook gives us more control over token lifecycle and
 * error handling. See ADR-007 for the full rationale.
 */
function useAuthFromAuthKit() {
  const { user, loading: isLoading } = useAuth();
  const { accessToken, loading: tokenLoading, error: tokenError } = useAccessToken();

  const loading = (isLoading ?? false) || (tokenLoading ?? false);
  const authenticated = !!user && !!accessToken && !loading;

  const stableAccessToken = useRef<string | null>(null);
  if (accessToken && !tokenError) {
    stableAccessToken.current = accessToken;
  }

  const fetchAccessToken = useCallback(async () => {
    if (stableAccessToken.current && !tokenError) {
      return stableAccessToken.current;
    }
    return null;
  }, [tokenError]);

  return {
    isLoading: loading,
    isAuthenticated: authenticated,
    fetchAccessToken,
  };
}
```

### Step 7.11: Create a useCurrentUser Hook

Create `src/hooks/useCurrentUser.ts`:

```typescript
"use client";

import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useCurrentUser() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.current, isAuthenticated ? {} : "skip");

  return {
    user: user ?? null,
    isLoading: authLoading || (isAuthenticated && user === undefined),
    isAuthenticated,
    isAdmin: user?.role === "admin",
  };
}
```

### Step 7.12: Create User Sync on Sign-In

We need to sync the WorkOS user to Convex after sign-in. Create a component that handles this.

> **Why a UserSync component?** The standard Convex + WorkOS integration accesses user info via `ctx.auth.getUserIdentity()` in Convex functions without a dedicated users table. This project needs a persistent `users` table because role-based access control requires a `role` field that isn't present in the WorkOS JWT. The `UserSync` component bridges this gap by writing WorkOS user data to our `users` table on each sign-in. See ADR-007.

Create `src/components/providers/UserSync.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { api } from "../../../convex/_generated/api";

export function UserSync({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  const { user } = useAuth();
  const syncUser = useMutation(api.users.syncFromWorkOS);

  useEffect(() => {
    if (isAuthenticated && user) {
      syncUser({
        workosId: user.id,
        email: user.email,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || undefined,
      }).catch((error) => {
        console.error("Failed to sync user:", error);
      });
    }
  }, [isAuthenticated, user, syncUser]);

  return <>{children}</>;
}
```

### Step 7.13: Update Homepage with Auth State

Update `src/app/page.tsx`:

```tsx
"use client";

import { usePaginatedQuery } from "convex/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";

export default function Home() {
  const { signOut } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">kyleschuller.dev</h1>

      <AuthLoading>
        <p className="mt-4 text-gray-600">Loading...</p>
      </AuthLoading>

      <Authenticated>
        <AuthenticatedContent onSignOut={() => signOut()} />
      </Authenticated>

      <Unauthenticated>
        <p className="mt-4 text-gray-600">Welcome to my blog.</p>
        <div className="mt-4 flex gap-2">
          <Link
            href="/sign-in"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
          >
            Sign up
          </Link>
        </div>
      </Unauthenticated>
    </main>
  );
}

function AuthenticatedContent({ onSignOut }: { onSignOut: () => void }) {
  const { user, isAdmin } = useCurrentUser();
  const { results: posts, status } = usePaginatedQuery(
    api.posts.getPublished,
    {},
    { initialNumItems: 10 }
  );

  return (
    <div className="mt-4 text-center">
      <p className="text-gray-600">
        Welcome, {user?.name || user?.email || "User"}!
        {isAdmin && (
          <span className="ml-2 rounded bg-purple-100 px-2 py-1 text-xs text-purple-800">
            Admin
          </span>
        )}
      </p>
      <p className="mt-2 text-gray-500">
        {status === "LoadingFirstPage" ? "Loading posts..." : `${posts.length} published posts`}
      </p>
      <div className="mt-4 flex gap-4">
        {isAdmin && (
          <Link
            href="/admin"
            className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            Admin Dashboard
          </Link>
        )}
        <button
          onClick={onSignOut}
          className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
```

### Step 7.14: Test Authentication

1. Make sure `npx convex dev` is running in one terminal
2. Run `npm run dev` in another terminal
3. Visit `http://localhost:3000`
4. Click "Sign in"
5. Create an account via WorkOS (you'll be redirected to their hosted UI)
6. After signing in, you should be redirected back and see:
   - Your name/email displayed
   - An "Admin" badge (you're the first user!)
   - "0 published posts"

### Step 7.15: Verify in Convex Dashboard

1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project
3. Click on **Data**
4. You should see your user in the `users` table with `role: "admin"`

### Step 7.16: Commit Phase 2

```bash
git add .
git commit -m "feat: complete Phase 2 — WorkOS auth with role-based access"
git push
```

---

## What You Now Have

- [x] Next.js 15 with TypeScript strict mode
- [x] Tailwind CSS v4 configured (CSS-first, no config file)
- [x] ESLint flat config + Prettier with pre-commit hooks
- [x] GitHub Actions CI pipeline (with Convex build fix)
- [x] Vitest testing setup with example tests
- [x] Environment variable validation with Zod (fail-fast on missing config)
- [x] Error boundary preventing full-page crashes on network failures
- [x] `.env.example` documenting all required variables
- [x] Convex backend with schema, queries, and mutations
- [x] Server-side identity validation in user sync
- [x] Correct index usage in queries (with documented ordering behaviour)
- [x] WorkOS authentication integrated
- [x] Role-based access control (first user is admin)
- [x] User sync between WorkOS and Convex (with documented divergence from standard pattern)
- [x] Sign-in and sign-up routes

---

## Next Steps

You're now ready to build the public blog UI (Phase 3 in the roadmap):

1. Create the blog listing page (`/blog`)
2. Create individual post pages (`/blog/[slug]`)
3. Set up MDX rendering with `next-mdx-remote`
4. Build the layout with header, footer, navigation
5. Implement SEO (meta tags, sitemap, robots.txt)
6. Integrate PostHog for page view tracking (instrumented from day one)
7. **Make the repository public** — progression through phases is the signal

---

## Troubleshooting

### "Not authenticated" errors

- Make sure `npx convex dev` is running
- Check that `WORKOS_CLIENT_ID` is set in Convex dashboard environment variables
- Verify your `.env.local` has all required variables

### Auth callback not working

- Verify `http://localhost:3000/callback` is set as redirect URI in WorkOS dashboard
- Check CORS is configured for `http://localhost:3000`

### TypeScript errors in Convex

- Run `npx convex dev` to regenerate types after schema changes
- Make sure you're importing from `convex/_generated/api` not `convex/api`

### CI build failing with Convex URL error

- Ensure your `.github/workflows/ci.yml` has the `NEXT_PUBLIC_CONVEX_URL` env var set in the build job (see Part 4)

### Environment validation errors on startup

- If you see "Invalid environment variables" errors, check your `.env.local` against `.env.example`
- Make sure URLs include the protocol (`https://` not just the domain)

### Tests failing

- Run `npm install` to ensure all dependencies are installed
- Check that `vitest.config.ts` exists and is correct

### ESLint errors about flat config

- Make sure you have `eslint.config.mjs` (not `.eslintrc.json`)
- If you see `.eslintrc.json`, delete it and use the flat config from Step 2.1
