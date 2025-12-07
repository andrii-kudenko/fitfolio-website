import { api } from "@/shared/lib/api";
import type {
  CommentCreate,
  CommentResponse,
  CommentPage,
  CommentLikeCreate,
  CommentLikeResponse,
} from "../types/comments.types";

export const commentsApi = {
  // Create a new comment
  create: async (payload: CommentCreate): Promise<CommentResponse> => {
    const { data } = await api.post<CommentResponse>("/comments", payload);
    return data;
  },

  // Get a single comment by ID
  getById: async (id: string): Promise<CommentResponse> => {
    const { data } = await api.get<CommentResponse>(`/comments/${id}`);
    return data;
  },

  // Get comments for a specific subject (item, collection, etc.)
  getForSubject: async (
    subjectType: string,
    subjectId: string,
    params?: { page?: number; size?: number; sort?: string }
  ): Promise<CommentPage> => {
    const { data } = await api.get<CommentPage>(
      `/comments/subject/${subjectType}/${subjectId}`,
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

  // Soft delete comment
  delete: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },

  // ---- Likes ----

  like: async (payload: CommentLikeCreate): Promise<CommentLikeResponse> => {
    const { data } = await api.post<CommentLikeResponse>(
      "/comment-likes",
      payload
    );
    return data;
  },

  unlike: async (userId: string, commentId: string): Promise<void> => {
    await api.delete("/comment-likes", {
      params: { userId, commentId },
    });
  },
};
