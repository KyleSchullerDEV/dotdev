import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import type { RehypeShikiOptions } from "@shikijs/rehype";

const shikiOptions: RehypeShikiOptions = {
  theme: "catppuccin-mocha",
  langs: [
    "typescript",
    "javascript",
    "tsx",
    "jsx",
    "css",
    "html",
    "bash",
    "json",
    "markdown",
    "yaml",
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const rehypePlugins: any[] = [
  rehypeSlug,
  [rehypeAutolinkHeadings, { behavior: "wrap" }],
  [rehypeShiki, shikiOptions],
];
