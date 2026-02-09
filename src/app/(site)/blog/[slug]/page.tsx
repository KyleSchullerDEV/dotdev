import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { MDXContent } from "@/components/mdx/MDXContent";
import { PostReadTracker } from "@/components/PostReadTracker";
import { formatDate, readingTime } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchQuery(api.posts.getBySlug, { slug });

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      authors: [post.authorName ?? "Kyle Schuller"],
      tags: post.tags ?? undefined,
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchQuery(api.posts.getBySlug, { slug });

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl">
      {/* Post header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <div className="text-text-secondary mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {post.publishedAt && (
            <time dateTime={new Date(post.publishedAt).toISOString()}>
              {formatDate(new Date(post.publishedAt))}
            </time>
          )}
          <span aria-hidden="true">&middot;</span>
          <span>{readingTime(post.body)}</span>
          {post.authorName && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{post.authorName}</span>
            </>
          )}
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-bg-secondary text-text-secondary rounded-full px-2.5 py-0.5 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Post body */}
      <MDXContent source={post.body} />

      {/* Analytics tracking */}
      <PostReadTracker slug={post.slug} title={post.title} />
    </article>
  );
}
