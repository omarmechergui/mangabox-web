"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { listLibrary, removeFromLibrary } from "@/lib/storage/library-repository";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { MangaCardSkeleton } from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";

export default function LibraryPageClient() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;

    listLibrary()
      .then((records) => {
        if (!ignore) {
          setItems(records);
          setIsLoading(false);
          setError(null);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [reloadTrigger]);

  const handleRetry = () => {
    setIsLoading(true);
    setReloadTrigger((n) => n + 1);
  };

  const handleRemove = async (e, sourceId, mangaId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFromLibrary(sourceId, mangaId);
      setItems((prev) => prev.filter((item) => item.compoundId !== `${sourceId}:${mangaId}`));
    } catch (err) {
      setError(err);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!filterQuery) return true;
    return item.title.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            My Library
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Manga saved locally in your browser via IndexedDB.
          </p>
        </div>

        {items.length > 0 && (
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Filter saved manga..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full h-9 rounded-lg border border-border bg-surface px-3 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent"
            />
          </div>
        )}
      </div>

      {/* Content States */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <MangaCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Could Not Open Library"
          message={error.message || "Failed to load titles from browser storage."}
          onRetry={handleRetry}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Your library is empty"
          description="Browse titles in the catalog and click 'Add to Library' to save them here for quick access."
          actionLabel="Explore Manga"
          actionHref="/search"
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No matching saved titles"
          description={`No titles in your library matched '${filterQuery}'.`}
          actionLabel="Clear Filter"
          onAction={() => setFilterQuery("")}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {filteredItems.map((item) => (
            <div key={item.compoundId} className="group relative flex flex-col gap-2">
              <Link
                href={`/manga/${encodeURIComponent(item.mangaId)}`}
                className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border bg-surface-secondary shadow-xs transition-all duration-200 group-hover:shadow-md"
              >
                <Image
                  src={item.coverUrl || "/images/placeholders/cover-apothecary.svg"}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />

                <div className="absolute top-2 right-2">
                  <Badge variant="accent" size="sm">
                    {item.status || "saved"}
                  </Badge>
                </div>
              </Link>

              <div className="flex flex-col gap-1 px-0.5">
                <Link
                  href={`/manga/${encodeURIComponent(item.mangaId)}`}
                  className="line-clamp-2 text-sm font-semibold text-text-primary group-hover:text-accent transition-colors"
                >
                  {item.title}
                </Link>

                <div className="flex items-center justify-between text-xs text-text-secondary mt-0.5">
                  <span className="line-clamp-1">{item.genres?.[0] || "Saved"}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, item.sourceId, item.mangaId)}
                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    aria-label={`Remove ${item.title} from library`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
