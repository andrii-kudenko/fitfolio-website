import { api } from "@/shared/lib/api";
import {
  ItemSearchResult,
  SearchFacetsResponse,
  SearchSort,
  SmartSearchResponse,
} from "../types/search.types";

export interface SearchParams {
  query: string;
  limit?: number;
}

export interface SearchWithFiltersParams {
  query?: string;
  brandIds?: string[];
  categoryIds?: string[];
  colors?: string[];
  departments?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SearchSort;
  limit?: number;
  offset?: number;
}

export interface SearchFacetsParams {
  query?: string;
  brandIds?: string[];
  categoryIds?: string[];
  colors?: string[];
  departments?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export const searchApi = {
  /**
   * Simple search: query + limit only. Uses semantic similarity.
   * GET /api/search
   */
  search: async (
    params: SearchParams,
    signal?: AbortSignal
  ): Promise<ItemSearchResult[]> => {
    const { data } = await api.get<ItemSearchResult[]>("/search", {
      params: {
        query: params.query,
        limit: params.limit ?? 20,
      },
      signal,
    });
    return data;
  },

  /**
   * Search with filters: query, brands, categories, colors, price, sort, pagination.
   * GET /api/search/with-filters
   */
  searchWithFilters: async (
    params: SearchWithFiltersParams,
    signal?: AbortSignal
  ): Promise<ItemSearchResult[]> => {
    const q = new URLSearchParams();
    if (params.query?.trim()) q.set("query", params.query.trim());
    params.brandIds?.forEach((id) => q.append("brandIds", id));
    params.categoryIds?.forEach((id) => q.append("categoryIds", id));
    params.colors?.forEach((c) => q.append("colors", c));
    params.departments?.forEach((d) => q.append("departments", d));
    if (params.minPrice != null) q.set("minPrice", String(params.minPrice));
    if (params.maxPrice != null) q.set("maxPrice", String(params.maxPrice));
    q.set("sort", params.sort ?? "RELEVANCE");
    q.set("limit", String(params.limit ?? 20));
    q.set("offset", String(params.offset ?? 0));

    const { data } = await api.get<ItemSearchResult[]>(
      `/search/with-filters?${q.toString()}`,
      { signal }
    );
    return data;
  },

  /**
   * Get facets (available filter options + counts + min/max price).
   * GET /api/search/filters
   */
  getFacets: async (
    params: SearchFacetsParams,
    signal?: AbortSignal
  ): Promise<SearchFacetsResponse> => {
    const q = new URLSearchParams();
    if (params.query?.trim()) q.set("query", params.query.trim());
    params.brandIds?.forEach((id) => q.append("brandIds", id));
    params.categoryIds?.forEach((id) => q.append("categoryIds", id));
    params.colors?.forEach((c) => q.append("colors", c));
    params.departments?.forEach((d) => q.append("departments", d));
    if (params.minPrice != null) q.set("minPrice", String(params.minPrice));
    if (params.maxPrice != null) q.set("maxPrice", String(params.maxPrice));

    const { data } = await api.get<SearchFacetsResponse>(
      `/search/filters?${q.toString()}`,
      { signal }
    );
    return data;
  },

  /**
   * Smart Search: hybrid brand/category + AI semantic parsing.
   * POST /api/smart-search
   */
  smartSearch: async (
    params: { query: string },
    signal?: AbortSignal
  ): Promise<SmartSearchResponse> => {
    console.log("smartSearch", params.query);
    const { data } = await api.post<SmartSearchResponse>(
      "/smart-search",
      { query: params.query?.trim() ?? "" },
      { signal }
    );
    return data;
  },
};

