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
