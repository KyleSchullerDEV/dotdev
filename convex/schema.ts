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
