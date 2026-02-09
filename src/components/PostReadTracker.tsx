"use client";

import { usePostRead } from "@/hooks/usePostRead";

interface PostReadTrackerProps {
  slug: string;
  title: string;
}

export function PostReadTracker({ slug, title }: PostReadTrackerProps) {
  usePostRead(slug, title);
  return null;
}
