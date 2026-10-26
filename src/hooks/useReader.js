"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  saveReadingProgress,
  getChapterProgress,
} from "@/lib/storage/progress-repository";

/**
 * Hook to manage reading state, modes, direction, image fit, and throttled persistence.
 */
export function useReader({
  sourceId = "mock",
  mangaId,
  chapterId,
  chapterTitle = "",
  totalPages = 1,
  initialMode = "vertical",
  initialDirection = "ltr",
  initialFit = "contain",
}) {
  const [mode, setMode] = useState(initialMode); // 'vertical' | 'paged'
  const [direction, setDirection] = useState(initialDirection); // 'ltr' | 'rtl'
  const [fit, setFit] = useState(initialFit); // 'contain' | 'width' | 'height'
  const [currentPage, setCurrentPage] = useState(0);
  const [isRestored, setIsRestored] = useState(false);
  const [storageError, setStorageError] = useState(null);

  const saveTimerRef = useRef(null);

  // Restore saved progress on mount
  useEffect(() => {
    let ignore = false;

    if (!mangaId || !chapterId) return;

    getChapterProgress(sourceId, mangaId, chapterId)
      .then((record) => {
        if (!ignore) {
          if (record && typeof record.pageIndex === "number") {
            const safePage = Math.min(
              Math.max(0, record.pageIndex),
              Math.max(0, totalPages - 1)
            );
            setCurrentPage(safePage);
          }
          setIsRestored(true);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setStorageError(err);
          setIsRestored(true);
        }
      });

    return () => {
      ignore = true;
    };
  }, [sourceId, mangaId, chapterId, totalPages]);

  // Persist progress with debouncing
  const persistProgress = useCallback(
    (pageIndex, immediate = false) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      const performSave = async () => {
        try {
          await saveReadingProgress({
            sourceId,
            mangaId,
            chapterId,
            pageIndex,
            totalPages,
            chapterTitle,
          });
          setStorageError(null);
        } catch (err) {
          setStorageError(err);
        }
      };

      if (immediate) {
        performSave();
      } else {
        saveTimerRef.current = setTimeout(performSave, 500);
      }
    },
    [sourceId, mangaId, chapterId, totalPages, chapterTitle]
  );

  // Change page in paged mode
  const goToPage = useCallback(
    (targetPage) => {
      const safe = Math.min(Math.max(0, targetPage), Math.max(0, totalPages - 1));
      setCurrentPage(safe);
      persistProgress(safe, false);
    },
    [totalPages, persistProgress]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return {
    mode,
    setMode,
    direction,
    setDirection,
    fit,
    setFit,
    currentPage,
    setCurrentPage,
    goToPage,
    nextPage,
    prevPage,
    isRestored,
    storageError,
    persistProgress,
  };
}
