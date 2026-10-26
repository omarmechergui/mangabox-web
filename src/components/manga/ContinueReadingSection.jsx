"use client";

import { useState, useEffect } from "react";
import ContinueReadingCard from "@/components/manga/ContinueReadingCard";
import { listRecentHistory } from "@/lib/storage/progress-repository";
import { defaultSourceManager } from "@/lib/sources";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ContinueReadingSection() {
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    listRecentHistory(4)
      .then(async (records) => {
        if (ignore) return;

        if (!records || records.length === 0) {
          setHistoryItems([]);
          setIsLoading(false);
          return;
        }

        // Hydrate coverUrl and title from defaultSourceManager
        const hydrated = await Promise.all(
          records.map(async (rec) => {
            try {
              const manga = await defaultSourceManager.getManga(rec.mangaId);
              return {
                mangaId: rec.mangaId,
                title: manga.title,
                coverUrl: manga.coverUrl,
                chapterId: rec.chapterId,
                chapterTitle: rec.chapterTitle || `Chapter ${rec.chapterId}`,
                pageProgress: rec.pageIndex + 1,
                totalPages: rec.totalPages || 1,
                percentComplete: rec.percentComplete || 0,
                lastReadAt: rec.updatedAt,
              };
            } catch {
              return {
                mangaId: rec.mangaId,
                title: rec.mangaId,
                coverUrl: "/images/placeholders/cover-apothecary.svg",
                chapterId: rec.chapterId,
                chapterTitle: rec.chapterTitle || "Chapter",
                pageProgress: rec.pageIndex + 1,
                totalPages: rec.totalPages || 1,
                percentComplete: rec.percentComplete || 0,
                lastReadAt: rec.updatedAt,
              };
            }
          })
        );

        if (!ignore) {
          setHistoryItems(hydrated);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setHistoryItems([]);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading) {
    return (
      <section aria-labelledby="continue-reading-heading" className="space-y-3">
        <div className="h-6 w-36 bg-surface-secondary animate-pulse rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </section>
    );
  }

  if (historyItems.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="continue-reading-heading">
      <div className="flex items-center justify-between mb-4">
        <h2
          id="continue-reading-heading"
          className="text-lg font-bold text-text-primary tracking-tight"
        >
          Continue Reading
        </h2>
        <span className="text-xs text-text-secondary">
          {historyItems.length} active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {historyItems.map((item) => (
          <ContinueReadingCard key={`${item.mangaId}-${item.chapterId}`} item={item} />
        ))}
      </div>
    </section>
  );
}
