interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`bg-bg-secondary animate-pulse rounded ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}
