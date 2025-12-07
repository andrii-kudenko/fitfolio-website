import { api } from "@/shared/lib/api";
import { ItemCreate, ItemResponse, ItemPage, PageMeta } from "../types/items.types";

export const itemsApi = {
  // getAll with pagination support
  getAll: async (params?: { page?: number; size?: number }): Promise<ItemPage> => {
    const { data } = await api.get<ItemPage>("/items", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    });
    return data; // { content, page }
  },

  // convenience: if you only want the array of items
  getAllItemsOnly: async (params?: { page?: number; size?: number }): Promise<ItemResponse[]> => {
    const { data } = await api.get<ItemPage>("/items", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    });
    return data.content;
  },

  getById: async (id: string): Promise<ItemResponse> => {
    const { data } = await api.get<ItemResponse>(`/items/${id}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<ItemResponse> => {
    const { data } = await api.get<ItemResponse>(`/items/slug/${slug}`);
    return data;
  },

  create: async (payload: ItemCreate): Promise<ItemResponse> => {
    const { data } = await api.post<ItemResponse>("/items", payload);
    return data;
  },

  // this will 404 until you actually implement /api/items/compare in backend
  compare: async (idA: string, idB: string): Promise<any> => {
    const { data } = await api.get(`/items/compare`, {
      params: { idA, idB },
    });
    return data;
  },
};