import { api } from "@/shared/lib/api";
import type {
  CollectionCreate,
  CollectionResponse,
  CollectionPage,
  CollectionLikeCreate,
  CollectionLikeResponse,
  CollectionItemCreate,
  CollectionItemResponse,
  CollectionItemPage,
} from "../types/collections.types";

export const collectionsApi = {
  // ---------------------------------------------------------------------------
  // Collections (owned by user)
  // ---------------------------------------------------------------------------

  createForUser: async (
    userId: string,
    payload: CollectionCreate
  ): Promise<CollectionResponse> => {
    const { data } = await api.post<CollectionResponse>(
      `/users/${userId}/collections`,
      payload
    );
    return data;
  },

  getForUser: async (
    userId: string,
    params?: { page?: number; size?: number; sort?: string }
  ): Promise<CollectionPage> => {
    const { data } = await api.get<CollectionPage>(
      `/users/${userId}/collections`,
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

  getById: async (id: string): Promise<CollectionResponse> => {
    const { data } = await api.get<CollectionResponse>(`/collections/${id}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<CollectionResponse> => {
    const { data } = await api.get<CollectionResponse>(
      `/collections/slug/${slug}`
    );
    return data;
  },

  // ---------------------------------------------------------------------------
  // Likes
  // ---------------------------------------------------------------------------

  like: async (payload: CollectionLikeCreate): Promise<CollectionLikeResponse> => {
    const { data } = await api.post<CollectionLikeResponse>(
      "/collection-likes",
      payload
    );
    return data;
  },

  unlike: async (userId: string, collectionId: string): Promise<void> => {
    await api.delete("/collection-likes", {
      params: { userId, collectionId },
    });
  },

  // ---------------------------------------------------------------------------
  // Items
  // ---------------------------------------------------------------------------

  addItem: async (
    payload: CollectionItemCreate
  ): Promise<CollectionItemResponse> => {
    const { data } = await api.post<CollectionItemResponse>(
      "/collection-items",
      payload
    );
    return data;
  },

  getItems: async (
    collectionId: string,
    params?: { page?: number; size?: number; sort?: string }
  ): Promise<CollectionItemPage> => {
    const { data } = await api.get<CollectionItemPage>(
      `/collections/${collectionId}/items`,
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
