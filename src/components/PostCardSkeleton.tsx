import { Skeleton } from "./Skeleton";

export function PostCardSkeleton() {
  return (
    <div className="border-border rounded-lg border p-6">
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="mt-2 h-4 w-32" />
      <Skeleton className="mt-3 h-5 w-full" />
      <Skeleton className="mt-2 h-5 w-2/3" />
    </div>
  );
}
