import type { PageResult } from "@/shared/types/pagination";

/** Backend `Comment.subjectType` — use uppercase strings. */
export type CommentSubjectType = "ITEM" | "COLLECTION" | "TIER_LIST";

// Java: CommentCreateRequest (POST /comments — user from session)
export interface CommentCreateRequest {
  parentId?: string | null;
  subjectId: string;
  subjectType: CommentSubjectType;
  text: string;
}

// Java: CommentCreate
export interface CommentCreate {
  userId: string;
  parentId?: string | null;
  subjectId: string;
  subjectType: string;
  text: string;
}

// For Item endpoints
export interface CommentCreateItem {
  parentId?: string | null;
  text: string;
}

// Java: CommentUpdate
export interface CommentUpdate {
  text: string;
}

// Java: CommentResponse
export interface CommentResponse {
  id: string;
  userId: string;

  userDisplayName?: string;

  parentId: string | null;
  subjectId: string;
  subjectType: string;
  text: string;
  likeCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CommentPage = PageResult<CommentResponse>;

// ---- Likes ----
export interface CommentLikeCreate {
  userId: string;
  commentId: string;
}

export interface CommentLikeResponse {
  id: string;
  userId: string;
  commentId: string;
  createdAt: string;
}

export type Comment = CommentResponse;
export type CommentLike = CommentLikeResponse;