import type { MDXComponents } from "mdx/types";
import { Code } from "./Code";
import { Callout } from "./Callout";
import { MDXImage } from "./MDXImage";

export const mdxComponents: MDXComponents = {
  pre: Code as MDXComponents["pre"],
  Callout,
  Image: MDXImage,
};
