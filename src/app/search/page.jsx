import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";
import { MangaCardSkeleton } from "@/components/ui/Skeleton";

export const metadata = {
  title: "Search Titles — MangaBox Web",
  description: "Filter and search manga by keyword, genre, and publication status.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-8 space-y-6">
          <div className="h-8 w-48 bg-surface-secondary animate-pulse rounded-md" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <MangaCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
