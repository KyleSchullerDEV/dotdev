"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PostCard } from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/PostCardSkeleton";
import { Button } from "@/components/ui/Button";

export default function BlogPage() {
  const {
    results: posts,
    status,
    loadMore,
  } = usePaginatedQuery(api.posts.getPublished, {}, { initialNumItems: 10 });

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
      <p className="text-text-secondary mt-2">
        Writing about frontend engineering, React, TypeScript, and the web.
      </p>

      {status === "LoadingFirstPage" && (
        <div className="mt-10 grid gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}

      {status !== "LoadingFirstPage" && posts.length === 0 && (
        <p className="text-text-secondary mt-10">No posts yet. Check back soon.</p>
      )}

      {posts.length > 0 && (
        <div className="mt-10 grid gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {status === "CanLoadMore" && (
        <div className="mt-10 text-center">
          <Button variant="secondary" size="lg" onPress={() => loadMore(10)}>
            Load more
          </Button>
        </div>
      )}

      {status === "LoadingMore" && (
        <div className="mt-10 text-center">
          <p className="text-text-tertiary text-sm">Loading more posts...</p>
        </div>
      )}
    </>
  );
}
