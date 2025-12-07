// src/features/reviews/api.ts
import { api } from "@/shared/lib/api";
import type {
  ReviewCreate,
  ReviewResponse,
  ReviewPage,
  ReviewMediaCreate,
  ReviewMediaResponse,
  ReviewLikeCreate,
  ReviewLikeResponse,
} from "../types/reviews.types";

export const reviewsApi = {
  // -----------------------------------------------------------------------
  // Reviews
  // -----------------------------------------------------------------------

  create: async (payload: ReviewCreate): Promise<ReviewResponse> => {
    const { data } = await api.post<ReviewResponse>("/reviews", payload);
    return data;
  },

  getById: async (id: string): Promise<ReviewResponse> => {
    const { data } = await api.get<ReviewResponse>(`/reviews/${id}`);
    return data;
  },

  getForItem: async (
    itemId: string,
    params?: { page?: number; size?: number; sort?: string }
  ): Promise<ReviewPage> => {
    const { data } = await api.get<ReviewPage>(`/items/${itemId}/reviews`, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        ...(params?.sort ? { sort: params.sort } : {}),
      },
    });
    return data;
  },

  getForUser: async (
    userId: string,
    params?: { page?: number; size?: number; sort?: string }
  ): Promise<ReviewPage> => {
    const { data } = await api.get<ReviewPage>(`/users/${userId}/reviews`, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        ...(params?.sort ? { sort: params.sort } : {}),
      },
    });
    return data;
  },

  // -----------------------------------------------------------------------
  // Media
  // -----------------------------------------------------------------------

  addMedia: async (
    payload: ReviewMediaCreate
  ): Promise<ReviewMediaResponse> => {
    const { data } = await api.post<ReviewMediaResponse>(
      "/review-media",
      payload
    );
    return data;
  },

  getMediaForReview: async (
    reviewId: string
  ): Promise<ReviewMediaResponse[]> => {
    const { data } = await api.get<ReviewMediaResponse[]>(
      `/reviews/${reviewId}/media`
    );
    return data;
  },

  // -----------------------------------------------------------------------
  // Likes
  // -----------------------------------------------------------------------

  like: async (payload: ReviewLikeCreate): Promise<ReviewLikeResponse> => {
    const { data } = await api.post<ReviewLikeResponse>(
      "/review-likes",
      payload
    );
    return data;
  },

  unlike: async (userId: string, reviewId: string): Promise<void> => {
    await api.delete("/review-likes", {
      params: { userId, reviewId },
    });
  },
};
