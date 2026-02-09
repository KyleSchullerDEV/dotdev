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
