"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchApi } from "../api/search.api";
import type { ItemSearchResult, SmartSearchResponse } from "../types/search.types";

export interface UseSmartSearchResult {
  items: ItemSearchResult[];
  parsed: SmartSearchResponse["parsed"] | null;
  isLoading: boolean;
  error: string | null;
  search: (query: string) => void;
  query: string;
}

export function useSmartSearch(initialQuery = ""): UseSmartSearchResult {
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<ItemSearchResult[]>([]);
  const [parsed, setParsed] = useState<SmartSearchResponse["parsed"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const doSearch = useCallback((q: string) => {
    const trimmed = q?.trim() ?? "";
    setQuery(trimmed);

    if (!trimmed) {
      setItems([]);
      setParsed(null);
      setError(null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    searchApi
      .smartSearch({ query: trimmed }, abortRef.current.signal)
      .then((res) => {
        setItems(res.items);
        setParsed(res.parsed);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Smart search failed");
          setItems([]);
          setParsed(null);
        }
      })
      .finally(() => {
        setIsLoading(false);
        abortRef.current = null;
      });
  }, []);

  return {
    items,
    parsed,
    isLoading,
    error,
    search: doSearch,
    query,
  };
}
