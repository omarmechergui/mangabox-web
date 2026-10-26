"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useLibrary } from "@/hooks/useLibrary";

export default function MangaDetailsClient({ manga, initialChapters = [] }) {
  const [sortAsc, setSortAsc] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { inLibrary, isLoading: isLibraryLoading, error: libraryError, toggleLibrary } = useLibrary(manga);

  const {
    id,
    title,
    altTitles = [],
    description,
    coverUrl,
    authors = [],
    artists = [],
    genres = [],
    status,
    contentRating,
  } = manga;

  const sortedChapters = [...initialChapters].sort((a, b) => {
    const numA = a.chapterNumber ?? 0;
    const numB = b.chapterNumber ?? 0;
    return sortAsc ? numA - numB : numB - numA;
  });

  const statusVariant = {
    ongoing: "accent",
    completed: "success",
    hiatus: "warning",
    unknown: "neutral",
  }[status || "unknown"] || "neutral";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-text-secondary">
        <Link href="/" className="hover:text-text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/search" className="hover:text-text-primary transition-colors">
          Manga
        </Link>
        <span>/</span>
        <span className="text-text-primary font-medium line-clamp-1">{title}</span>
      </nav>

      {/* Main Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 rounded-2xl border border-border bg-surface p-5 sm:p-7 shadow-xs">
        {/* Cover Column */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
          <div className="relative aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-xl border border-border bg-surface-secondary shadow-md">
            <Image
              src={coverUrl || "/images/placeholders/cover-apothecary.svg"}
              alt={`Cover art for ${title}`}
              fill
              priority
              sizes="(max-width: 768px) 70vw, 260px"
              className="object-cover"
            />
          </div>

          {/* Action buttons under cover */}
          <div className="mt-4 w-full max-w-[260px] space-y-2">
            <Button
              variant={inLibrary ? "secondary" : "primary"}
              size="md"
              disabled={isLibraryLoading}
              className="w-full justify-center"
              onClick={toggleLibrary}
              ariaLabel={inLibrary ? "Remove from Library" : "Add to Library"}
            >
              {isLibraryLoading ? (
                "Checking..."
              ) : inLibrary ? (
                <>
                  <svg className="w-4 h-4 mr-1.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  In Library
                </>
              ) : (
                "+ Add to Library"
              )}
            </Button>

            {libraryError ? (
              <p className="text-[11px] text-center text-rose-500">
                Storage error: {libraryError.message}
              </p>
            ) : (
              <p className="text-[11px] text-center text-text-secondary">
                {inLibrary ? "Saved locally in IndexedDB" : "Saves locally in your browser"}
              </p>
            )}
          </div>
        </div>

        {/* Details Column */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant} size="md">
                {status || "unknown"}
              </Badge>
              {contentRating && contentRating !== "unknown" && (
                <Badge variant="neutral" size="md">
                  {contentRating}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              {title}
            </h1>

            {altTitles.length > 0 && (
              <p className="text-xs text-text-secondary line-clamp-1">
                Also known as: <span className="italic">{altTitles.join(", ")}</span>
              </p>
            )}

            {/* Creators metadata */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-text-secondary pt-1">
              {authors.length > 0 && (
                <div>
                  <span className="font-semibold text-text-primary">Author: </span>
                  {authors.join(", ")}
                </div>
              )}
              {artists.length > 0 && (
                <div>
                  <span className="font-semibold text-text-primary">Artist: </span>
                  {artists.join(", ")}
                </div>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {genres.map((g) => (
                  <Link key={g} href={`/search?genre=${encodeURIComponent(g)}`}>
                    <Badge variant="neutral" size="sm" className="hover:border-accent hover:text-accent transition-colors">
                      {g}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="pt-2">
              <p
                className={`text-sm text-text-secondary leading-relaxed ${
                  !isExpanded ? "line-clamp-3" : ""
                }`}
              >
                {description || "No description provided for this mock title."}
              </p>
              {description && description.length > 180 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex items-center gap-6 border-t border-border pt-4 text-xs text-text-secondary">
            <div>
              <span className="font-semibold text-text-primary text-sm block">
                {initialChapters.length}
              </span>
              Chapters
            </div>
            <div>
              <span className="font-semibold text-text-primary text-sm block">
                IndexedDB
              </span>
              Storage Target
            </div>
          </div>
        </div>
      </div>

      {/* Chapter List Section */}
      <section aria-labelledby="chapters-heading" className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 id="chapters-heading" className="text-lg font-bold text-text-primary tracking-tight">
              Chapters ({initialChapters.length})
            </h2>
            <p className="text-xs text-text-secondary">
              Available chapters in mock source
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortAsc(!sortAsc)}
            className="text-xs gap-1.5"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${sortAsc ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
            {sortAsc ? "Oldest First" : "Newest First"}
          </Button>
        </div>

        {sortedChapters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-secondary">
            No chapters available for this title yet.
          </div>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
            {sortedChapters.map((ch) => (
              <div
                key={ch.id}
                className="flex items-center justify-between p-3.5 sm:px-5 hover:bg-surface-secondary/50 transition-colors"
              >
                <div className="min-w-0 pr-4">
                  <h3 className="text-sm font-medium text-text-primary line-clamp-1">
                    {ch.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-text-secondary">
                    {ch.chapterNumber !== null && (
                      <span className="font-mono">Ch. {ch.chapterNumber}</span>
                    )}
                    {ch.publishedAt && (
                      <>
                        <span>•</span>
                        <span>{new Date(ch.publishedAt).toLocaleDateString()}</span>
                      </>
                    )}
                    {ch.pageCount && (
                      <>
                        <span>•</span>
                        <span>{ch.pageCount} pages</span>
                      </>
                    )}
                  </div>
                </div>

                <Button
                  href={`/reader/${encodeURIComponent(id)}/${encodeURIComponent(ch.id)}`}
                  variant="secondary"
                  size="sm"
                  className="shrink-0 text-xs"
                >
                  Read
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
