import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface PostCardProps {
  post: {
    title: string;
    slug: string;
    excerpt: string;
    publishedAt?: number;
    tags?: string[];
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group border-border hover:border-border-secondary rounded-lg border p-6 transition-colors">
      <Link href={`/blog/${post.slug}`} className="block no-underline">
        <h3 className="text-text group-hover:text-accent text-xl font-semibold">{post.title}</h3>
        {post.publishedAt && (
          <time
            dateTime={new Date(post.publishedAt).toISOString()}
            className="text-text-tertiary mt-2 block text-sm"
          >
            {formatDate(new Date(post.publishedAt))}
          </time>
        )}
        <p className="text-text-secondary mt-3">{post.excerpt}</p>
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
      </Link>
    </article>
  );
}
