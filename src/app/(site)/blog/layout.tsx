import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles about frontend engineering, React, TypeScript, and web development.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
