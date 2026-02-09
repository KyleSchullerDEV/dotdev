"use client";

import Link from "next/link";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PostCard } from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/PostCardSkeleton";

export default function Home() {
  const { results: posts, status } = usePaginatedQuery(
    api.posts.getPublished,
    {},
    { initialNumItems: 3 }
  );

  return (
    <>
      {/* Hero */}
      <section className="py-12 sm:py-20">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Kyle Schuller</h1>
        <p className="text-text-secondary mt-2 text-xl">Frontend Engineer</p>
        <p className="text-text-secondary mt-6 max-w-2xl text-lg leading-relaxed">
          I write about frontend engineering, React, TypeScript, and building for the web. This is
          where I document what I learn and share what I build.
        </p>
        <Link
          href="/blog"
          className="bg-accent hover:bg-accent-hover mt-8 inline-block rounded-md px-6 py-3 text-sm font-medium text-white no-underline transition-colors"
        >
          Read the blog
        </Link>
      </section>

      {/* Recent Posts */}
      <section className="py-12">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Recent Posts</h2>
          <Link href="/blog" className="text-sm font-medium">
            View all
          </Link>
        </div>

        {status === "LoadingFirstPage" && (
          <div className="mt-8 grid gap-6">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        )}

        {status !== "LoadingFirstPage" && posts.length === 0 && (
          <p className="text-text-secondary mt-8">No posts yet. Check back soon.</p>
        )}

        {posts.length > 0 && (
          <div className="mt-8 grid gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
