"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useSearch } from "@/features/search/hooks/useSearch";
import { itemSearchResultToItemFullResponse } from "@/features/search/utils/itemSearchResultToItemFullResponse";
import type { SearchSort } from "@/features/search/types/search.types";
import ItemCard from "@/features/items/components/ItemCard";
import { brandsApi } from "@/features/brands/api/brands.api";
import { categoriesApi } from "@/features/categories/api/categories.api";
import type { BrandResponse } from "@/features/brands/types/brands.types";
import type { CategoryResponse } from "@/features/categories/types/categories.types";

const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "RELEVANCE", label: "RELEVANCE" },
  { value: "POPULARITY_VIEWS", label: "MOST VIEWED" },
  { value: "POPULARITY_LIKES", label: "MOST LIKED" },
  { value: "DATE_ADDED", label: "NEWEST" },
  { value: "RATING", label: "HIGHEST RATING" },
];

function parseUrlState(searchParams: URLSearchParams) {
  const q = searchParams.get("q") ?? "";
  const brandIds = searchParams.getAll("brandIds").filter(Boolean);
  const categoryIds = searchParams.getAll("categoryIds").filter(Boolean);
  const colors = searchParams.getAll("colors").filter(Boolean);
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = (searchParams.get("sort") ?? "RELEVANCE") as SearchSort;
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));

  return {
    query: q,
    selectedBrandIds: brandIds,
    selectedCategoryIds: categoryIds,
    selectedColors: colors,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    sort,
    page,
  };
}

function buildUrlString(state: {
  query: string;
  selectedBrandIds: string[];
  selectedCategoryIds: string[];
  selectedColors: string[];
  minPrice?: number;
  maxPrice?: number;
  sort: SearchSort;
  page: number;
}) {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  state.selectedBrandIds.forEach((id) => params.append("brandIds", id));
  state.selectedCategoryIds.forEach((id) => params.append("categoryIds", id));
  state.selectedColors.forEach((c) => params.append("colors", c));
  if (state.minPrice != null) params.set("minPrice", String(state.minPrice));
  if (state.maxPrice != null) params.set("maxPrice", String(state.maxPrice));
  if (state.sort !== "RELEVANCE") params.set("sort", state.sort);
  if (state.page > 0) params.set("page", String(state.page));
  return params.toString();
}

function ItemsPageContent() {
  const searchParams = useSearchParams();
  const urlState = useMemo(() => parseUrlState(searchParams), [searchParams]);

  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  const {
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
  } = useSearch(urlState);

  // Sync URL -> state when user navigates (e.g. "Search with filters" from navbar)
  const prevUrlStateRef = useRef(urlState);
  useEffect(() => {
    const prev = prevUrlStateRef.current;
    const eq =
      prev.query === urlState.query &&
      JSON.stringify(prev.selectedBrandIds) === JSON.stringify(urlState.selectedBrandIds) &&
      JSON.stringify(prev.selectedCategoryIds) === JSON.stringify(urlState.selectedCategoryIds) &&
      JSON.stringify(prev.selectedColors) === JSON.stringify(urlState.selectedColors) &&
      prev.minPrice === urlState.minPrice &&
      prev.maxPrice === urlState.maxPrice &&
      prev.sort === urlState.sort &&
      prev.page === urlState.page;
    prevUrlStateRef.current = urlState;
    if (eq) return;
    setQuery(urlState.query);
    setSelectedBrandIds(urlState.selectedBrandIds);
    setSelectedCategoryIds(urlState.selectedCategoryIds);
    setSelectedColors(urlState.selectedColors);
    setMinPrice(urlState.minPrice);
    setMaxPrice(urlState.maxPrice);
    setSort(urlState.sort);
    setPage(urlState.page);
  }, [urlState]);

  // Sync state -> URL when state changes
  useEffect(() => {
    const str = buildUrlString(state);
    const desired = str ? `?${str}` : "";
    const current = window.location.search;
    if (desired !== current) {
      window.history.replaceState(null, "", desired || "/items");
    }
  }, [state]);

  // Load brands and categories for display names
  useEffect(() => {
    brandsApi.getAllSimple().then(setBrands).catch(() => setBrands([]));
    categoriesApi.getAllSimple().then(setCategories).catch(() => setCategories([]));
  }, []);

  const brandMap = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands]);
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const handleQueryChange = (q: string) => {
    setQuery(q);
  };

  const handleBrandToggle = (id: string) => {
    setSelectedBrandIds(
      state.selectedBrandIds.includes(id)
        ? state.selectedBrandIds.filter((x) => x !== id)
        : [...state.selectedBrandIds, id]
    );
  };

  const handleCategoryToggle = (id: string) => {
    setSelectedCategoryIds(
      state.selectedCategoryIds.includes(id)
        ? state.selectedCategoryIds.filter((x) => x !== id)
        : [...state.selectedCategoryIds, id]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(
      state.selectedColors.includes(color)
        ? state.selectedColors.filter((x) => x !== color)
        : [...state.selectedColors, color]
    );
  };

  const itemFullResponses = useMemo(
    () => items.map(itemSearchResultToItemFullResponse),
    [items]
  );

  return (
    <main className="bg-black text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/items" className="text-white underline">
              Search
            </Link>
          </div>
        </nav>

        <div className="flex gap-8">
          {/* Filter sidebar */}
          <aside className="w-56 flex-shrink-0 space-y-6">
            <h3 className="text-white/60 text-sm font-medium uppercase">Filters</h3>

            {facets && (
              <>
                {facets.brands.length > 0 && (
                  <div>
                    <div className="text-white text-sm font-medium mb-2">Brand</div>
                    <div className="flex flex-col gap-1">
                      {facets.brands.map((f) => (
                        <label
                          key={f.value}
                          className="flex items-center gap-2 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={state.selectedBrandIds.includes(f.value)}
                            onChange={() => handleBrandToggle(f.value)}
                            className="rounded border-white/20"
                          />
                          <span>{brandMap.get(f.value) ?? f.value}</span>
                          <span className="text-white/50">({f.count})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {facets.categories.length > 0 && (
                  <div>
                    <div className="text-white text-sm font-medium mb-2">Category</div>
                    <div className="flex flex-col gap-1">
                      {facets.categories.map((f) => (
                        <label
                          key={f.value}
                          className="flex items-center gap-2 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={state.selectedCategoryIds.includes(f.value)}
                            onChange={() => handleCategoryToggle(f.value)}
                            className="rounded border-white/20"
                          />
                          <span>{categoryMap.get(f.value) ?? f.value}</span>
                          <span className="text-white/50">({f.count})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {facets.colors.length > 0 && (
                  <div>
                    <div className="text-white text-sm font-medium mb-2">Color</div>
                    <div className="flex flex-col gap-1">
                      {facets.colors.map((f) => (
                        <label
                          key={f.value}
                          className="flex items-center gap-2 cursor-pointer text-sm capitalize"
                        >
                          <input
                            type="checkbox"
                            checked={state.selectedColors.includes(f.value)}
                            onChange={() => handleColorToggle(f.value)}
                            className="rounded border-white/20"
                          />
                          <span>{f.value}</span>
                          <span className="text-white/50">({f.count})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {(facets.minPrice != null || facets.maxPrice != null) && (
                  <div>
                    <div className="text-white text-sm font-medium mb-2">Price</div>
                    <div className="flex items-center gap-2 text-sm">
                      <input
                        type="number"
                        placeholder="Min"
                        value={state.minPrice ?? ""}
                        onChange={(e) =>
                          setMinPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        className="w-20 px-2 py-1 bg-white/5 border border-white/20 rounded text-white"
                      />
                      <span className="text-white/50">–</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={state.maxPrice ?? ""}
                        onChange={(e) =>
                          setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                        className="w-20 px-2 py-1 bg-white/5 border border-white/20 rounded text-white"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {isLoadingFacets && (
              <div className="text-white/50 text-sm">Loading filters...</div>
            )}
          </aside>

          {/* Main content */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              {/* <input
                type="text"
                placeholder="Search items..."
                value={state.query}
                onChange={(e) => handleQueryChange(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 outline-none focus:border-ff-cyan min-w-[200px]"
              /> */}

              <div className="ml-auto flex items-center gap-2">
                <span className="text-white/60 text-sm font-medium">SORT BY</span>
                <select
                  value={state.sort}
                  onChange={(e) => setSort(e.target.value as SearchSort)}
                  className="appearance-none pl-4 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:border-ff-cyan focus:outline-none cursor-pointer min-w-[160px]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm mb-4">{error}</div>
            )}

            {isLoadingItems ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[260px] min-h-[260px] bg-white/5 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : itemFullResponses.length === 0 ? (
              <div className="text-center py-16 text-white/60">
                No items found. Try a different search or filters.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {itemFullResponses.map((item) => (
                    <ItemCard key={item.item.id} item={item} />
                  ))}
                </div>

                <div className="mt-8 flex justify-center gap-4">
                  {state.page > 0 && (
                    <button
                      onClick={() => setPage(state.page - 1)}
                      className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
                    >
                      Previous
                    </button>
                  )}
                  {items.length >= state.limit && (
                    <button
                      onClick={() => setPage(state.page + 1)}
                      className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
                    >
                      Next
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ItemsPage() {
  return (
    <Suspense fallback={
      <main className="bg-black text-white pt-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-96 animate-pulse bg-white/5 rounded-lg" />
        </div>
      </main>
    }>
      <ItemsPageContent />
    </Suspense>
  );
}
