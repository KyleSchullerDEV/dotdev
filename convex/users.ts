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
    // calls will execute sequentially, not interleave.
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
