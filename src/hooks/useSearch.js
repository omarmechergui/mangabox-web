"use client";

import { useState, useEffect, useCallback } from "react";
import { searchManga } from "@/features/manga/manga-service";

/**
 * Custom hook to perform search queries with loading and error states,
 * supporting source provider selection.
 */
export function useSearch({
  initialQuery = "",
  initialGenre = "",
  initialStatus = "",
  initialSource = "mock",
} = {}) {
  const [query, setQuery] = useState(initialQuery);
  const [genre, setGenre] = useState(initialGenre);
  const [status, setStatus] = useState(initialStatus);
  const [sourceId, setSourceId] = useState(initialSource);
  const [state, setState] = useState({
    results: [],
    isLoading: true,
    error: null,
  });

  const runSearch = useCallback((q, g, s, src) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    searchManga(
      q,
      {
        genre: g || undefined,
        status: s || undefined,
      },
      src
    )
      .then((data) => {
        setState({ results: data, isLoading: false, error: null });
      })
      .catch((err) => {
        setState({ results: [], isLoading: false, error: err });
      });
  }, []);

  useEffect(() => {
    let ignore = false;
    searchManga(
      query,
      {
        genre: genre || undefined,
        status: status || undefined,
      },
      sourceId
    )
      .then((data) => {
        if (!ignore) {
          setState({ results: data, isLoading: false, error: null });
        }
      })
      .catch((err) => {
        if (!ignore) {
          setState({ results: [], isLoading: false, error: err });
        }
      });

    return () => {
      ignore = true;
    };
  }, [query, genre, status, sourceId]);

  const retry = useCallback(() => {
    runSearch(query, genre, status, sourceId);
  }, [query, genre, status, sourceId, runSearch]);

  return {
    query,
    setQuery,
    genre,
    setGenre,
    status,
    setStatus,
    sourceId,
    setSourceId,
    results: state.results,
    isLoading: state.isLoading,
    error: state.error,
    retry,
  };
}
