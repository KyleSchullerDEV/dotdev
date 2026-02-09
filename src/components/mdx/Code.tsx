import { CopyButton } from "./CopyButton";
import type { ReactElement } from "react";

interface CodeProps {
  children: ReactElement<{ children?: string; className?: string }>;
  [key: string]: unknown;
}

function extractText(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as ReactElement).props;
    if (props && typeof props === "object" && "children" in props) {
      return extractText(props.children);
    }
  }
  return "";
}

export function Code({ children, ...props }: CodeProps) {
  const codeText = extractText(children);

  return (
    <div className="group relative">
      <CopyButton text={codeText} />
      <pre {...props}>{children}</pre>
    </div>
  );
}
