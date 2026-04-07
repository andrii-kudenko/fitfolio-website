"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchApi } from "../api/search.api";
import type { CollectionsAndTierListsSearchResponse } from "../types/listsSearch.types";

const DEBOUNCE_MS = 350;

function readLoggedInUserId(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("fitfolio_logged_in");
  if (!raw) return null;
  try {
    const u = JSON.parse(raw) as { id?: string };
    return typeof u?.id === "string" ? u.id : null;
  } catch {
    return null;
  }
}

export interface UseListsSearchResult {
  data: CollectionsAndTierListsSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Debounced search for public collections + tier lists by title.
 * `query` should usually come from the URL `q` param; updates debounce network calls.
 */
export function useListsSearch(query: string, limit = 20): UseListsSearchResult {
  const [data, setData] = useState<CollectionsAndTierListsSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const runFetch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        if (abortRef.current) abortRef.current.abort();
        setData({ collections: [], tierLists: [] });
        setIsLoading(false);
        setError(null);
        return;
      }

      const id = ++requestIdRef.current;
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;
      const viewerUserId = readLoggedInUserId();

      setIsLoading(true);
      setError(null);

      searchApi
        .searchCollectionsAndTierLists(
          { query: trimmed, viewerUserId: viewerUserId ?? undefined, limit },
          signal
        )
        .then((res) => {
          if (id !== requestIdRef.current) return;
          setData(res);
        })
        .catch((err: unknown) => {
          if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "AbortError")
            return;
          if (id !== requestIdRef.current) return;
          setError(err instanceof Error ? err.message : "Search failed");
          setData(null);
        })
        .finally(() => {
          if (id !== requestIdRef.current) return;
          setIsLoading(false);
        });
    },
    [limit]
  );

  useEffect(() => {
    const t = window.setTimeout(() => runFetch(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, runFetch]);

  return {
    data,
    isLoading,
    error,
    refetch: () => runFetch(query),
  };
}
