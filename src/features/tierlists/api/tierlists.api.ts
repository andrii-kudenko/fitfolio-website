import { api } from "@/shared/lib/api";
import type {
  TierListCreate,
  TierListResponse,
  TierListPage,
  TierListLikeCreate,
  TierListLikeResponse,
  TierCreate,
  TierResponse,
  TierListItemCreate,
  TierListItemResponse,
  TierListItemPage,
} from "../types/tierlists.types";

export const tierlistsApi = {
  // -------------------------------------------------------------------------
  // TierLists (owned by user)
  // -------------------------------------------------------------------------

  createForUser: async (
    userId: string,
    payload: TierListCreate
  ): Promise<TierListResponse> => {
    const { data } = await api.post<TierListResponse>(
      `/users/${userId}/tierlists`,
      payload
    );
    return data;
  },

  getForUser: async (
    userId: string,
    params?: { page?: number; size?: number; sort?: string }
  ): Promise<TierListPage> => {
    const { data } = await api.get<TierListPage>(
      `/users/${userId}/tierlists`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          ...(params?.sort ? { sort: params.sort } : {}),
        },
      }
    );
    return data;
  },

  getById: async (id: string): Promise<TierListResponse> => {
    const { data } = await api.get<TierListResponse>(`/tierlists/${id}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<TierListResponse> => {
    const { data } = await api.get<TierListResponse>(
      `/tierlists/slug/${slug}`
    );
    return data;
  },

  // -------------------------------------------------------------------------
  // Likes
  // -------------------------------------------------------------------------

  like: async (payload: TierListLikeCreate): Promise<TierListLikeResponse> => {
    const { data } = await api.post<TierListLikeResponse>(
      "/tierlist-likes",
      payload
    );
    return data;
  },

  unlike: async (userId: string, tierListId: string): Promise<void> => {
    await api.delete("/tierlist-likes", {
      params: { userId, tierListId },
    });
  },

  // -------------------------------------------------------------------------
  // Tiers
  // -------------------------------------------------------------------------

  createTier: async (
    tierListId: string,
    payload: TierCreate
  ): Promise<TierResponse> => {
    const { data } = await api.post<TierResponse>(
      `/tierlists/${tierListId}/tiers`,
      payload
    );
    return data;
  },

  getTiers: async (tierListId: string): Promise<TierResponse[]> => {
    const { data } = await api.get<TierResponse[]>(
      `/tierlists/${tierListId}/tiers`
    );
    return data;
  },

  // -------------------------------------------------------------------------
  // TierList items
  // -------------------------------------------------------------------------

  addItem: async (
    payload: TierListItemCreate
  ): Promise<TierListItemResponse> => {
    const { data } = await api.post<TierListItemResponse>(
      "/tierlist-items",
      payload
    );
    return data;
  },

  getItems: async (
    tierListId: string,
    params?: { page?: number; size?: number; sort?: string }
  ): Promise<TierListItemPage> => {
    const { data } = await api.get<TierListItemPage>(
      `/tierlists/${tierListId}/items`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 50,
          ...(params?.sort ? { sort: params.sort } : {}),
        },
      }
    );
    return data;
  },
};
