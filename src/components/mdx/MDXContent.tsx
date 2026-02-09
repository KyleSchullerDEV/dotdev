import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "./mdx-components";
import { rehypePlugins } from "./mdx-plugins";

interface MDXContentProps {
  source: string;
}

export async function MDXContent({ source }: MDXContentProps) {
  return (
    <div className="prose">
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          mdxOptions: {
            rehypePlugins,
          },
        }}
      />
    </div>
  );
}
