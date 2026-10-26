"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import SearchBar from "@/components/search/SearchBar";
import MangaCard from "@/components/manga/MangaCard";
import { MangaCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";
import { useSearch } from "@/hooks/useSearch";

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Mystery", "Sports", "Slice of Life"];
const STATUSES = [
  { label: "All Statuses", value: "" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
];

const SOURCES = [
  { label: "Mock Catalog (Local)", value: "mock" },
  { label: "Open Manga (Public Domain)", value: "open-manga" },
  { label: "MyAnimeList (Jikan API)", value: "jikan-catalog" },
];

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlQuery = searchParams.get("q") || "";
  const urlGenre = searchParams.get("genre") || "";
  const urlStatus = searchParams.get("status") || "";
  const urlSource = searchParams.get("source") || "mock";

  const {
    query,
    setQuery,
    genre,
    setGenre,
    status,
    setStatus,
    sourceId,
    setSourceId,
    results,
    isLoading,
    error,
    retry,
  } = useSearch({
    initialQuery: urlQuery,
    initialGenre: urlGenre,
    initialStatus: urlStatus,
    initialSource: urlSource,
  });

  // Sync state if URL changes (e.g. back/forward navigation or search from header)
  useEffect(() => {
    setQuery(urlQuery);
    setGenre(urlGenre);
    setStatus(urlStatus);
    setSourceId(urlSource);
  }, [urlQuery, urlGenre, urlStatus, urlSource, setQuery, setGenre, setStatus, setSourceId]);

  const updateUrl = (newQuery, newGenre, newStatus, newSource) => {
    const params = new URLSearchParams();
    if (newQuery) params.set("q", newQuery);
    if (newGenre) params.set("genre", newGenre);
    if (newStatus) params.set("status", newStatus);
    if (newSource && newSource !== "mock") params.set("source", newSource);
    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ""}`);
  };

  const handleGenreToggle = (g) => {
    const nextGenre = genre === g ? "" : g;
    setGenre(nextGenre);
    updateUrl(query, nextGenre, status, sourceId);
  };

  const handleStatusChange = (s) => {
    setStatus(s);
    updateUrl(query, genre, s, sourceId);
  };

  const handleSourceChange = (src) => {
    setSourceId(src);
    updateUrl(query, genre, status, src);
  };

  const handleResetFilters = () => {
    setGenre("");
    setStatus("");
    updateUrl(query, "", "", sourceId);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">
      {/* Top Header & Search Input */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Search Manga
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Browse through titles across registered providers, filter by genre, or search by keywords.
          </p>
        </div>

        <div className="max-w-2xl">
          <SearchBar initialQuery={query} autoFocus={!urlQuery} />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-y border-border py-3">
        {/* Source Provider Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="source-select" className="text-xs font-semibold text-text-primary">
            Source:
          </label>
          <select
            id="source-select"
            value={sourceId}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-text-primary focus:outline-none focus:border-accent"
          >
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Genre Chips */}
        <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Filter by genre">
          <span className="text-xs font-medium text-text-secondary mr-1">Genre:</span>
          {GENRES.map((g) => {
            const isSelected = genre.toLowerCase() === g.toLowerCase();
            return (
              <button
                key={g}
                type="button"
                onClick={() => handleGenreToggle(g)}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer border ${
                  isSelected
                    ? "bg-accent text-white border-accent font-medium shadow-xs"
                    : "bg-surface-secondary text-text-secondary border-border hover:text-text-primary hover:border-text-secondary/40"
                }`}
                aria-pressed={isSelected}
              >
                {g}
              </button>
            );
          })}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <label htmlFor="status-filter" className="text-xs font-medium text-text-secondary">
            Status:
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {(genre || status) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs h-8 px-2"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Result Meta & Provider Disclaimers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-text-secondary">
        <span>
          {isLoading ? (
            "Searching provider..."
          ) : (
            <>
              Found <strong className="text-text-primary font-medium">{results.length}</strong>{" "}
              {results.length === 1 ? "manga" : "mangas"} on{" "}
              <span className="font-mono text-accent">{sourceId}</span>
              {query && (
                <>
                  {" "}for &ldquo;<span className="text-text-primary">{query}</span>&rdquo;
                </>
              )}
            </>
          )}
        </span>

        {sourceId === "jikan-catalog" && (
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            Notice: Jikan is a catalog index. Full chapter page streams are not hosted.
          </span>
        )}
      </div>

      {/* Main Results View */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <MangaCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Search Failed"
          message={error.message || "Failed to retrieve manga titles."}
          onRetry={retry}
        />
      ) : results.length === 0 ? (
        <EmptyState
          title="No manga matched your query"
          description={
            query || genre || status
              ? "Try adjusting your keywords, selecting different genres, or switching source provider."
              : "No titles are currently available in this catalog."
          }
          actionLabel={genre || status || query ? "Clear Filters" : undefined}
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {results.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
}
