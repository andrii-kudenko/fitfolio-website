import { api } from "@/shared/lib/api";
import { ItemSearchResult } from "../types/search.types";

export interface SearchParams {
  query: string;
  limit?: number;
}

export const searchApi = {
  /**
   * Search items using the backend search API
   * @param params - Search parameters including query string and optional limit
   * @returns Array of search results with similarity scores
   */
  search: async (params: SearchParams): Promise<ItemSearchResult[]> => {
    const { data } = await api.get<ItemSearchResult[]>("/search", {
      params: {
        query: params.query,
        limit: params.limit ?? 20,
      },
    });
    return data;
  },
};

