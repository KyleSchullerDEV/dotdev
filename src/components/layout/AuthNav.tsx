"use client";

import { useConvexAuth } from "convex/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function AuthNav() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user, isAdmin } = useCurrentUser();

  if (isLoading) {
    return <div className="bg-bg-secondary h-9 w-20 animate-pulse rounded-md" aria-hidden="true" />;
  }

  if (!isAuthenticated) {
    return (
      <a
        href="/sign-in"
        className="border-border text-text-secondary hover:border-border-secondary hover:text-text rounded-md border px-3 py-1.5 text-sm font-medium no-underline transition-colors"
      >
        Sign in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isAdmin && (
        <span className="bg-bg-secondary text-text-secondary rounded-full px-2 py-0.5 text-xs font-medium">
          Admin
        </span>
      )}
      <span className="text-text-secondary hidden text-sm sm:inline">
        {user?.name || user?.email}
      </span>
      <a
        href="/sign-out"
        className="border-border text-text-secondary hover:border-border-secondary hover:text-text rounded-md border px-3 py-1.5 text-sm font-medium no-underline transition-colors"
      >
        Sign out
      </a>
    </div>
  );
}
