"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchApi } from "../api/search.api";
import type { ListsSearchResponse } from "../types/listsSearch.types";

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
  data: ListsSearchResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Unified lists feed: latest public lists when `query` is empty; debounced relevance search when non-empty.
 * `query` usually comes from URL `q`.
 */
export function useListsSearch(query: string, limit = 20): UseListsSearchResult {
  const [data, setData] = useState<ListsSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const runFetch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      const id = ++requestIdRef.current;
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const signal = abortRef.current.signal;
      const viewerUserId = readLoggedInUserId();

      setIsLoading(true);
      setError(null);

      searchApi
        .searchLists(
          {
            ...(trimmed ? { query: trimmed } : {}),
            viewerUserId: viewerUserId ?? undefined,
            limit,
          },
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
    const trimmed = query.trim();
    const delay = trimmed ? DEBOUNCE_MS : 0;
    const t = window.setTimeout(() => runFetch(query), delay);
    return () => clearTimeout(t);
  }, [query, runFetch]);

  return {
    data,
    isLoading,
    error,
    refetch: () => runFetch(query),
  };
}
