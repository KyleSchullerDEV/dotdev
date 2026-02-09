import { Skeleton } from "@/components/Skeleton";
import { PostCardSkeleton } from "@/components/PostCardSkeleton";

export default function BlogLoading() {
  return (
    <>
      <Skeleton className="h-10 w-32" />
      <Skeleton className="mt-2 h-6 w-96" />
      <div className="mt-10 grid gap-6">
        {Array.from({ length: 3 }, (_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
