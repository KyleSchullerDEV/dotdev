"use client";

import { ReactNode, useCallback, useEffect, useRef } from "react";
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
  useEffect(() => {
    if (accessToken && !tokenError) {
      stableAccessToken.current = accessToken;
    }
  }, [accessToken, tokenError]);

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
