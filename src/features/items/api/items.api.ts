import { api } from "@/shared/lib/api";
import {
  ItemCreate,
  ItemResponse,
  ItemPage,
  ItemViewerPage,
  ItemLikeResponse,
  ItemLikeCreate,
  ItemFullResponse,
  ItemSaveCreate,
  ItemSaveResponse,
  ItemSavedPage,
} from "../types/items.types";

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

  getTopRecommended: async (
    viewerUserId?: string | null
  ): Promise<ItemFullResponse[]> => {
    const { data } = await api.get<ItemFullResponse[]>("/items/top-recommended", {
      params: viewerUserId ? { viewerUserId } : {},
    });
    return data;
  },

  getById: async (id: string): Promise<ItemResponse> => {
    const { data } = await api.get<ItemResponse>(`/items/${id}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<ItemResponse> => {
    const { data } = await api.get<ItemResponse>(`/items/slug/${slug}`);
    return data;
  },

  getBySlugFull: async (
    slug: string,
    viewerUserId?: string | null
  ): Promise<ItemFullResponse> => {
    const { data } = await api.get<ItemFullResponse>(`/items/slug/${slug}/full`, {
      params: viewerUserId ? { viewerUserId } : {},
    });
    return data;
  },

  /** Full payload + related entities; increments view count (use for product page). */
  getBySlugDetail: async (
    slug: string,
    viewerUserId?: string | null
  ): Promise<ItemFullResponse> => {
    const { data } = await api.get<ItemFullResponse>(`/items/slug/${slug}/detail`, {
      params: viewerUserId ? { viewerUserId } : {},
    });
    return data;
  },

  /** Items where {@code contributorId} equals {@code userId}. */
  getForContributor: async (
    userId: string,
    params?: {
      page?: number;
      size?: number;
      sort?: string;
      viewerUserId?: string | null;
    }
  ): Promise<ItemViewerPage> => {
    const { data } = await api.get<ItemViewerPage>(`/users/${userId}/items`, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        ...(params?.sort ? { sort: params.sort } : {}),
        ...(params?.viewerUserId ? { viewerUserId: params.viewerUserId } : {}),
      },
    });
    return data;
  },

  create: async (payload: ItemCreate): Promise<ItemResponse> => {
    const { data } = await api.post<ItemResponse>("/items", payload);
    return data;
  },

  // -----------------------------------------------------------------------
  // Likes
  // -----------------------------------------------------------------------

  like: async (payload: ItemLikeCreate): Promise<ItemLikeResponse> => {
    const { data } = await api.post<ItemLikeResponse>(
      "/items/likes",
      payload
    );
    return data;
  },

  unlike: async (userId: string, itemId: string): Promise<void> => {
    await api.delete("/items/likes", {
      params: { userId, itemId },
    });
  },

  // -----------------------------------------------------------------------
  // Saves (explicit pool — not tied to collection / tier-list rows)
  // -----------------------------------------------------------------------

  save: async (payload: ItemSaveCreate): Promise<ItemSaveResponse> => {
    const { data } = await api.post<ItemSaveResponse>("/items/saves", payload);
    return data;
  },

  unsave: async (userId: string, itemId: string): Promise<void> => {
    await api.delete("/items/saves", {
      params: { userId, itemId },
    });
  },

  isSaved: async (userId: string, itemId: string): Promise<boolean> => {
    const { data } = await api.get<boolean>("/items/saves/exists", {
      params: { userId, itemId },
    });
    return data;
  },

  listSaved: async (
    userId: string,
    params?: { page?: number; size?: number }
  ): Promise<ItemSavedPage> => {
    const { data } = await api.get<ItemSavedPage>("/items/saves", {
      params: {
        userId,
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    });
    return data;
  },
};