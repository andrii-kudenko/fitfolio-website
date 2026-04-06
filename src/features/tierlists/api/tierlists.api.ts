import { api } from "@/shared/lib/api";
import type {
  TierListCreate,
  TierListCreateWithTiers,
  TierListResponse,
  TierListViewerPage,
  TierListDetailResponse,
  TierListLikeCreate,
  TierListLikeResponse,
  TierListSaveCreate,
  TierListSaveResponse,
  TierListSavedPage,
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

  createComplete: async (
    userId: string,
    payload: TierListCreateWithTiers
  ): Promise<TierListResponse> => {
    const { data } = await api.post<TierListResponse>(
      `/users/${userId}/tierlists/complete`,
      payload
    );
    return data;
  },

  updateComplete: async (
    tierListId: string,
    userId: string,
    payload: TierListCreateWithTiers
  ): Promise<TierListResponse> => {
    const { data } = await api.put<TierListResponse>(
      `/tierlists/${tierListId}?userId=${userId}`,
      payload
    );
    return data;
  },

  getForUser: async (
    userId: string,
    params?: {
      page?: number;
      size?: number;
      sort?: string;
      /** When set, each row includes isLiked / isSaved / isCommented for this user. */
      viewerUserId?: string | null;
    }
  ): Promise<TierListViewerPage> => {
    const { data } = await api.get<TierListViewerPage>(`/users/${userId}/tierlists`, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        ...(params?.sort ? { sort: params.sort } : {}),
        ...(params?.viewerUserId ? { viewerUserId: params.viewerUserId } : {}),
      },
    });
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

  getDetailBySlug: async (slug: string): Promise<TierListDetailResponse> => {
    const { data } = await api.get<TierListDetailResponse>(
      `/tierlists/slug/${slug}/detail`
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
  // Saves (bookmarks — independent of owning the tier list)
  // -------------------------------------------------------------------------

  save: async (payload: TierListSaveCreate): Promise<TierListSaveResponse> => {
    const { data } = await api.post<TierListSaveResponse>(
      "/tierlist-saves",
      payload
    );
    return data;
  },

  unsave: async (userId: string, tierListId: string): Promise<void> => {
    await api.delete("/tierlist-saves", {
      params: { userId, tierListId },
    });
  },

  isSaved: async (userId: string, tierListId: string): Promise<boolean> => {
    const { data } = await api.get<boolean>("/tierlist-saves/exists", {
      params: { userId, tierListId },
    });
    return data;
  },

  listSaved: async (
    userId: string,
    params?: { page?: number; size?: number }
  ): Promise<TierListSavedPage> => {
    const { data } = await api.get<TierListSavedPage>("/tierlist-saves", {
      params: {
        userId,
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    });
    return data;
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
