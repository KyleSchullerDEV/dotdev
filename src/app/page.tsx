"use client";

import { usePaginatedQuery } from "convex/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">kyleschuller.dev</h1>

      <AuthLoading>
        <p className="mt-4 text-gray-600">Loading...</p>
      </AuthLoading>

      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>

      <Unauthenticated>
        <p className="mt-4 text-gray-600">Welcome to my blog.</p>
        <div className="mt-4 flex gap-2">
          <a
            href="/sign-in"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
          >
            Sign up
          </a>
        </div>
      </Unauthenticated>
    </main>
  );
}

function AuthenticatedContent() {
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
        <a
          href="/sign-out"
          className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
        >
          Sign out
        </a>
      </div>
    </div>
  );
}
