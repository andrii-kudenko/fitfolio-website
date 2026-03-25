import { api } from "@/shared/lib/api";
import type {
  CommentCreateItem,
  CommentResponse,
  CommentPage,
  CommentUpdate,
} from "../types/comments.types";

export const commentsApi = {
  // -----------------------------
  // Item comments
  // -----------------------------

  createForItem: async (
    itemId: string,
    payload: CommentCreateItem
  ): Promise<CommentResponse> => {
    const { data } = await api.post<CommentResponse>(
      `/items/${itemId}/comments`,
      payload
    );
    return data;
  },

  listForItem: async (
    itemId: string,
    params?: { page?: number; size?: number; sort?: "newest" | "top" }
  ): Promise<CommentPage> => {
    const { data } = await api.get<CommentPage>(`/items/${itemId}/comments`, {
      params: {
        sort: params?.sort ?? "newest",
        page: params?.page ?? 0,
        size: params?.size ?? 50,
      },
    });
    return data;
  },

  // -----------------------------
  // Replies
  // -----------------------------

  reply: async (
    parentCommentId: string,
    payload: { text: string }
  ): Promise<CommentResponse> => {
    const { data } = await api.post<CommentResponse>(
      `/comments/${parentCommentId}/reply`,
      payload
    );
    return data;
  },

  // -----------------------------
  // Comment CRUD
  // -----------------------------

  getById: async (id: string): Promise<CommentResponse> => {
    const { data } = await api.get<CommentResponse>(`/comments/${id}`);
    return data;
  },

  update: async (
    id: string,
    payload: CommentUpdate
  ): Promise<CommentResponse> => {
    const { data } = await api.put<CommentResponse>(`/comments/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },

  // -----------------------------
  // Likes
  // -----------------------------

  like: async (commentId: string) => {
    const { data } = await api.post(`/comment-likes/${commentId}`);
    return data;
  },

  unlike: async (commentId: string) => {
    await api.delete(`/comment-likes/${commentId}`);
  },
};