"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isInLibrary,
  addToLibrary,
  removeFromLibrary,
} from "@/lib/storage/library-repository";

/**
 * Custom hook to interact with a manga's library membership in IndexedDB.
 *
 * @param {Object} manga - Normalized manga object
 */
export function useLibrary(manga) {
  const [inLibrary, setInLibrary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const mangaId = manga?.id;
  const sourceId = manga?.sourceId;

  useEffect(() => {
    let ignore = false;

    if (!mangaId || !sourceId) {
      return;
    }

    isInLibrary(sourceId, mangaId)
      .then((exists) => {
        if (!ignore) {
          setInLibrary(exists);
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
  }, [mangaId, sourceId]);

  const toggleLibrary = useCallback(async () => {
    if (!manga?.id || !manga?.sourceId) return;

    try {
      setError(null);
      if (inLibrary) {
        await removeFromLibrary(manga.sourceId, manga.id);
        setInLibrary(false);
      } else {
        await addToLibrary(manga);
        setInLibrary(true);
      }
    } catch (err) {
      setError(err);
    }
  }, [manga, inLibrary]);

  return {
    inLibrary,
    isLoading,
    error,
    toggleLibrary,
  };
}
