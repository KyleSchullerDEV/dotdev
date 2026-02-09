import { PostCardSkeleton } from "@/components/PostCardSkeleton";
import { Skeleton } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <>
      <section className="py-12 sm:py-20">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="mt-2 h-7 w-48" />
        <Skeleton className="mt-6 h-20 w-full max-w-2xl" />
        <Skeleton className="mt-8 h-12 w-40" />
      </section>
      <section className="py-12">
        <Skeleton className="h-8 w-48" />
        <div className="mt-8 grid gap-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </section>
    </>
  );
}
