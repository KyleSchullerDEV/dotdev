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
      })
        .then(() => {
          import("posthog-js")
            .then(({ default: posthog }) => {
              posthog.identify(user.id, {
                email: user.email,
                name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || undefined,
              });
            })
            .catch(() => {
              // PostHog not available — silently skip
            });
        })
        .catch((error) => {
          console.error("Failed to sync user:", error);
        });
    }
  }, [isAuthenticated, user, syncUser]);

  return <>{children}</>;
}
