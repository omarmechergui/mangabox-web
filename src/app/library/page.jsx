import { Suspense } from "react";
import LibraryPageClient from "./LibraryPageClient";
import { MangaCardSkeleton } from "@/components/ui/Skeleton";

export const metadata = {
  title: "My Library — MangaBox Web",
  description: "View and manage your saved manga titles persisted in IndexedDB.",
};

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-8 space-y-6">
          <div className="h-8 w-40 bg-surface-secondary animate-pulse rounded-md" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <MangaCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <LibraryPageClient />
    </Suspense>
  );
}
