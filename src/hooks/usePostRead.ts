"use client";

import { useEffect, useRef } from "react";

export function usePostRead(slug: string, title: string) {
  const hasFired = useRef(false);

  useEffect(() => {
    hasFired.current = false;

    const timer = setTimeout(async () => {
      if (hasFired.current) return;

      try {
        const posthog = (await import("posthog-js")).default;
        posthog.capture("post_read", {
          slug,
          title,
          time_on_page_seconds: 30,
        });
      } catch {
        // PostHog not initialized — silently skip
      }
      hasFired.current = true;
    }, 30_000);

    return () => clearTimeout(timer);
  }, [slug, title]);
}
