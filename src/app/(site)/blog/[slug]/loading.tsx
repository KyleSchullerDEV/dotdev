import { Skeleton } from "@/components/Skeleton";

export default function BlogPostLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <Skeleton className="h-10 w-3/4" />
      <div className="mt-4 flex gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="mt-10 space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-6 h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="mt-6 h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    </div>
  );
}
