export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-secondary dark:bg-surface-secondary/70 ${className}`}
      aria-hidden="true"
    />
  );
}

export function MangaCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
