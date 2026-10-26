"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ReaderControls({
  manga,
  chapter,
  prevChapter,
  nextChapter,
  mode,
  setMode,
  direction,
  setDirection,
  fit,
  setFit,
  currentPage,
  totalPages,
  goToPage,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-reader-surface/95 p-3 sm:px-4 text-reader-text backdrop-blur-md shadow-lg">
      {/* Top Row: Back, Chapter Title, Chapter Jump */}
      <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            href={`/manga/${encodeURIComponent(manga.id)}`}
            variant="ghost"
            size="sm"
            className="text-reader-text-secondary hover:text-white hover:bg-white/10 text-xs px-2"
            ariaLabel={`Back to ${manga.title}`}
          >
            ← Back
          </Button>

          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white line-clamp-1">
              {manga.title}
            </h1>
            <p className="text-xs text-reader-text-secondary line-clamp-1">
              {chapter.title}
            </p>
          </div>
        </div>

        {/* Chapter Navigation Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {prevChapter ? (
            <Button
              href={`/reader/${encodeURIComponent(manga.id)}/${encodeURIComponent(prevChapter.id)}`}
              variant="outline"
              size="sm"
              className="text-xs h-8 px-2.5 text-reader-text border-white/20 hover:bg-white/10"
              ariaLabel={`Previous chapter: ${prevChapter.title}`}
            >
              Prev Ch.
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="text-xs h-8 px-2.5 text-reader-text/40 border-white/10"
            >
              First Ch.
            </Button>
          )}

          {nextChapter ? (
            <Button
              href={`/reader/${encodeURIComponent(manga.id)}/${encodeURIComponent(nextChapter.id)}`}
              variant="primary"
              size="sm"
              className="text-xs h-8 px-2.5"
              ariaLabel={`Next chapter: ${nextChapter.title}`}
            >
              Next Ch. →
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="text-xs h-8 px-2.5 text-reader-text/40 border-white/10"
            >
              Latest Ch.
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Row: Mode, Direction, Fit, and Page Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={() => setMode("vertical")}
            className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
              mode === "vertical"
                ? "bg-accent text-white shadow-xs"
                : "text-reader-text-secondary hover:text-white"
            }`}
            aria-pressed={mode === "vertical"}
          >
            Vertical
          </button>
          <button
            type="button"
            onClick={() => setMode("paged")}
            className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
              mode === "paged"
                ? "bg-accent text-white shadow-xs"
                : "text-reader-text-secondary hover:text-white"
            }`}
            aria-pressed={mode === "paged"}
          >
            Paged
          </button>
        </div>

        {/* Direction Selector (Only in paged mode) */}
        {mode === "paged" && (
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setDirection("ltr")}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                direction === "ltr"
                  ? "bg-white/20 text-white"
                  : "text-reader-text-secondary hover:text-white"
              }`}
              aria-pressed={direction === "ltr"}
            >
              LTR
            </button>
            <button
              type="button"
              onClick={() => setDirection("rtl")}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                direction === "rtl"
                  ? "bg-white/20 text-white"
                  : "text-reader-text-secondary hover:text-white"
              }`}
              aria-pressed={direction === "rtl"}
            >
              RTL
            </button>
          </div>
        )}

        {/* Image Fit Controls */}
        <div className="flex items-center gap-1.5 text-reader-text-secondary">
          <label htmlFor="fit-select" className="text-[11px]">
            Fit:
          </label>
          <select
            id="fit-select"
            value={fit}
            onChange={(e) => setFit(e.target.value)}
            className="h-7 rounded border border-white/20 bg-black/50 px-2 text-xs text-white focus:outline-none focus:border-accent"
          >
            <option value="contain">Contain</option>
            <option value="width">Width</option>
            <option value="height">Height</option>
          </select>
        </div>

        {/* Page progress jump selector */}
        {totalPages > 0 && (
          <div className="flex items-center gap-1.5 font-mono text-xs text-reader-text-secondary ml-auto">
            <span>Page</span>
            <select
              aria-label="Jump to page"
              value={currentPage}
              onChange={(e) => goToPage(Number(e.target.value))}
              className="h-7 rounded border border-white/20 bg-black/50 px-1.5 text-xs text-white font-mono focus:outline-none"
            >
              {Array.from({ length: totalPages }).map((_, i) => (
                <option key={i} value={i}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span>/ {totalPages}</span>
          </div>
        )}
      </div>
    </div>
  );
}
