"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ReaderControls from "@/components/reader/ReaderControls";
import { useReader } from "@/hooks/useReader";

export default function ReaderViewClient({
  manga,
  chapter,
  pages = [],
  prevChapter,
  nextChapter,
}) {
  const totalPages = pages.length;

  const {
    mode,
    setMode,
    direction,
    setDirection,
    fit,
    setFit,
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    isRestored,
    storageError,
    persistProgress,
  } = useReader({
    sourceId: manga.sourceId,
    mangaId: manga.id,
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    totalPages,
    initialMode: "vertical",
    initialDirection: "ltr",
    initialFit: "contain",
  });

  const pageRefs = useRef([]);

  // Keyboard navigation for Paged Mode
  useEffect(() => {
    if (mode !== "paged") return;

    const handleKeyDown = (e) => {
      // Ignore if user is inside an input or select
      if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (direction === "rtl") {
          prevPage();
        } else {
          nextPage();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (direction === "rtl") {
          nextPage();
        } else {
          prevPage();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, direction, nextPage, prevPage]);

  // In vertical mode: observe scrolling pages to update reading progress
  useEffect(() => {
    if (mode !== "vertical" || !isRestored || totalPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIdx = Number(entry.target.getAttribute("data-page-index"));
            if (!isNaN(pageIdx)) {
              persistProgress(pageIdx, false);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [mode, isRestored, totalPages, persistProgress]);

  // Fit CSS classes
  const fitClass = {
    contain: "max-h-[85vh] w-auto max-w-full object-contain mx-auto",
    width: "w-full h-auto object-cover",
    height: "h-[90vh] w-auto max-w-none object-contain mx-auto",
  }[fit] || "max-h-[85vh] w-auto max-w-full object-contain mx-auto";

  return (
    <div className="min-h-screen bg-reader-bg text-reader-text flex flex-col justify-between">
      {/* Sticky Top Reader Controls */}
      <div className="sticky top-0 z-30 w-full p-2 sm:p-4 max-w-4xl mx-auto">
        <ReaderControls
          manga={manga}
          chapter={chapter}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          mode={mode}
          setMode={setMode}
          direction={direction}
          setDirection={setDirection}
          fit={fit}
          setFit={setFit}
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
        />
        {storageError && (
          <p className="mt-1 text-[11px] text-amber-400 text-center">
            Storage notice: Unable to sync progress ({storageError.message})
          </p>
        )}
      </div>

      {/* Main Reading Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 w-full max-w-5xl mx-auto">
        {pages.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-reader-surface p-12 text-center text-reader-text-secondary">
            No page assets available for this chapter.
          </div>
        ) : mode === "vertical" ? (
          /* Vertical Mode */
          <div className="flex flex-col gap-4 w-full items-center">
            {pages.map((page, idx) => (
              <div
                key={page.id}
                ref={(el) => (pageRefs.current[idx] = el)}
                data-page-index={idx}
                className="relative flex flex-col items-center w-full bg-reader-surface/50 rounded-lg overflow-hidden border border-white/5"
              >
                <Image
                  src={page.imageUrl}
                  alt={`Page ${idx + 1}`}
                  width={page.width || 800}
                  height={page.height || 1200}
                  className={fitClass}
                  priority={idx < 2}
                  loading={idx < 2 ? "eager" : "lazy"}
                />
                <span className="py-1 text-[11px] font-mono text-reader-text-secondary/60">
                  {idx + 1} / {totalPages}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Paged Mode */
          <div className="flex flex-col items-center justify-center w-full gap-4">
            <div
              className="relative flex items-center justify-center w-full min-h-[60vh] bg-reader-surface/40 rounded-xl border border-white/5 p-2"
              tabIndex={0}
              aria-label={`Reading page ${currentPage + 1} of ${totalPages}`}
            >
              {pages[currentPage] && (
                <Image
                  src={pages[currentPage].imageUrl}
                  alt={`Page ${currentPage + 1} of ${totalPages}`}
                  width={pages[currentPage].width || 800}
                  height={pages[currentPage].height || 1200}
                  className={fitClass}
                  priority
                />
              )}
            </div>

            {/* Previous / Next Page Controls for Paged Mode */}
            <div className="flex items-center justify-between w-full max-w-md gap-3 py-2">
              <button
                type="button"
                onClick={direction === "rtl" ? nextPage : prevPage}
                disabled={direction === "rtl" ? currentPage >= totalPages - 1 : currentPage <= 0}
                className="flex-1 h-10 rounded-lg border border-white/15 bg-reader-surface hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-medium cursor-pointer transition-colors"
                aria-label="Previous Page"
              >
                ← {direction === "rtl" ? "Next (RTL)" : "Previous"}
              </button>

              <span className="font-mono text-xs text-reader-text-secondary">
                {currentPage + 1} / {totalPages}
              </span>

              <button
                type="button"
                onClick={direction === "rtl" ? prevPage : nextPage}
                disabled={direction === "rtl" ? currentPage <= 0 : currentPage >= totalPages - 1}
                className="flex-1 h-10 rounded-lg border border-white/15 bg-reader-surface hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-medium cursor-pointer transition-colors"
                aria-label="Next Page"
              >
                {direction === "rtl" ? "Previous (RTL)" : "Next"} →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Footer Navigation */}
      <footer className="w-full py-6 text-center text-xs text-reader-text-secondary border-t border-white/5 mt-8">
        <div className="flex items-center justify-center gap-4">
          {prevChapter && (
            <Link
              href={`/reader/${encodeURIComponent(manga.id)}/${encodeURIComponent(prevChapter.id)}`}
              className="hover:text-white transition-colors"
            >
              ← Previous Chapter
            </Link>
          )}
          <Link
            href={`/manga/${encodeURIComponent(manga.id)}`}
            className="hover:text-white transition-colors"
          >
            Manga Overview
          </Link>
          {nextChapter && (
            <Link
              href={`/reader/${encodeURIComponent(manga.id)}/${encodeURIComponent(nextChapter.id)}`}
              className="hover:text-white transition-colors"
            >
              Next Chapter →
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
