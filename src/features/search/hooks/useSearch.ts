"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchApi } from "../api/search.api";
import type {
  ItemSearchResult,
  SearchFacetsResponse,
  SearchSort,
} from "../types/search.types";

const DEBOUNCE_MS = 300;
const DEFAULT_LIMIT = 20;

export interface UseSearchState {
  query: string;
  selectedBrandIds: string[];
  selectedCategoryIds: string[];
  selectedColors: string[];
  minPrice?: number;
  maxPrice?: number;
  sort: SearchSort;
  page: number;
  limit: number;
}

export interface UseSearchResult {
  items: ItemSearchResult[];
  facets: SearchFacetsResponse | null;
  isLoadingItems: boolean;
  isLoadingFacets: boolean;
  error: string | null;
  setQuery: (q: string) => void;
  setSelectedBrandIds: (ids: string[]) => void;
  setSelectedCategoryIds: (ids: string[]) => void;
  setSelectedColors: (colors: string[]) => void;
  setMinPrice: (v: number | undefined) => void;
  setMaxPrice: (v: number | undefined) => void;
  setSort: (s: SearchSort) => void;
  setPage: (p: number) => void;
  state: UseSearchState;
}

export function useSearch(initialState?: Partial<UseSearchState>): UseSearchResult {
  const [state, setState] = useState<UseSearchState>({
    query: "",
    selectedBrandIds: [],
    selectedCategoryIds: [],
    selectedColors: [],
    minPrice: undefined,
    maxPrice: undefined,
    sort: "RELEVANCE",
    page: 0,
    limit: DEFAULT_LIMIT,
    ...initialState,
  });

  const [items, setItems] = useState<ItemSearchResult[]>([]);
  const [facets, setFacets] = useState<SearchFacetsResponse | null>(null);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingFacets, setIsLoadingFacets] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsAbortRef = useRef<AbortController | null>(null);
  const facetsAbortRef = useRef<AbortController | null>(null);
  const itemsRequestIdRef = useRef(0);
  const facetsRequestIdRef = useRef(0);
  const stateRef = useRef(state);
  const isInitialMount = useRef(true);
  const filtersEffectHasRun = useRef(false);
  const sortPageEffectHasRun = useRef(false);
  stateRef.current = state;

  const fetchItems = useCallback(() => {
    const s = stateRef.current;
    const id = ++itemsRequestIdRef.current;
    if (itemsAbortRef.current) itemsAbortRef.current.abort();
    itemsAbortRef.current = new AbortController();

    setIsLoadingItems(true);
    setError(null);

    searchApi
      .searchWithFilters(
        {
          query: s.query.trim() || undefined,
          brandIds: s.selectedBrandIds.length ? s.selectedBrandIds : undefined,
          categoryIds: s.selectedCategoryIds.length ? s.selectedCategoryIds : undefined,
          colors: s.selectedColors.length ? s.selectedColors : undefined,
          minPrice: s.minPrice,
          maxPrice: s.maxPrice,
          sort: s.sort,
          limit: s.limit,
          offset: s.page * s.limit,
        },
        itemsAbortRef.current.signal
      )
      .then((data) => {
        if (id === itemsRequestIdRef.current) setItems(data);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (id === itemsRequestIdRef.current) {
          setError(err.message || "Failed to load items");
          setItems([]);
        }
      })
      .finally(() => {
        if (id === itemsRequestIdRef.current) setIsLoadingItems(false);
      });
  }, []);

  const fetchFacets = useCallback(() => {
    const s = stateRef.current;
    const id = ++facetsRequestIdRef.current;
    if (facetsAbortRef.current) facetsAbortRef.current.abort();
    facetsAbortRef.current = new AbortController();

    setIsLoadingFacets(true);

    searchApi
      .getFacets(
        {
          query: s.query.trim() || undefined,
          brandIds: s.selectedBrandIds.length ? s.selectedBrandIds : undefined,
          categoryIds: s.selectedCategoryIds.length ? s.selectedCategoryIds : undefined,
          colors: s.selectedColors.length ? s.selectedColors : undefined,
          minPrice: s.minPrice,
          maxPrice: s.maxPrice,
        },
        facetsAbortRef.current.signal
      )
      .then((data) => {
        if (id === facetsRequestIdRef.current) setFacets(data);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (id === facetsRequestIdRef.current) setFacets(null);
      })
      .finally(() => {
        if (id === facetsRequestIdRef.current) setIsLoadingFacets(false);
      });
  }, []);

  // Debounce query: when state.query changes, wait then refetch both
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const doFetch = () => {
      debounceTimerRef.current = null;
      fetchItems();
      fetchFacets();
    };

    if (isInitialMount.current) {
      isInitialMount.current = false;
      doFetch();
    } else {
      debounceTimerRef.current = setTimeout(doFetch, DEBOUNCE_MS);
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [state.query, fetchItems, fetchFacets]);

  // Filters changed: refetch both (skip on mount; query effect handles initial)
  useEffect(() => {
    if (!filtersEffectHasRun.current) {
      filtersEffectHasRun.current = true;
      return;
    }
    if (debounceTimerRef.current) return;
    fetchItems();
    fetchFacets();
  }, [
    state.selectedBrandIds,
    state.selectedCategoryIds,
    state.selectedColors,
    state.minPrice,
    state.maxPrice,
  ]);

  // Sort or page changed: refetch items only (skip on mount)
  useEffect(() => {
    if (!sortPageEffectHasRun.current) {
      sortPageEffectHasRun.current = true;
      return;
    }
    if (debounceTimerRef.current) return;
    fetchItems();
  }, [state.sort, state.page]);

  const setQuery = useCallback((q: string) => {
    setState((s) => (s.query === q ? s : { ...s, query: q, page: 0 }));
  }, []);

  const setSelectedBrandIds = useCallback((ids: string[]) => {
    setState((s) => ({ ...s, selectedBrandIds: ids, page: 0 }));
  }, []);

  const setSelectedCategoryIds = useCallback((ids: string[]) => {
    setState((s) => ({ ...s, selectedCategoryIds: ids, page: 0 }));
  }, []);

  const setSelectedColors = useCallback((colors: string[]) => {
    setState((s) => ({ ...s, selectedColors: colors, page: 0 }));
  }, []);

  const setMinPrice = useCallback((v: number | undefined) => {
    setState((s) => ({ ...s, minPrice: v, page: 0 }));
  }, []);

  const setMaxPrice = useCallback((v: number | undefined) => {
    setState((s) => ({ ...s, maxPrice: v, page: 0 }));
  }, []);

  const setSort = useCallback((sort: SearchSort) => {
    setState((s) => (s.sort === sort ? s : { ...s, sort, page: 0 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState((s) => (s.page === page ? s : { ...s, page }));
  }, []);

  return {
    items,
    facets,
    isLoadingItems,
    isLoadingFacets,
    error,
    setQuery,
    setSelectedBrandIds,
    setSelectedCategoryIds,
    setSelectedColors,
    setMinPrice,
    setMaxPrice,
    setSort,
    setPage,
    state,
  };
}
