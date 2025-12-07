import type { PageResult } from "@/shared/types/pagination";

// ---- DTO mirrors ----

// Java: CommentCreate
export interface CommentCreate {
  userId: string;
  parentId?: string | null;
  subjectId: string;
  subjectType: string; // "ITEM" | "COLLECTION" | "TIER_LIST" | ...
  text: string;
}

// Java: CommentResponse
export interface CommentResponse {
  id: string;
  userId: string;
  parentId: string | null;
  subjectId: string;
  subjectType: string;
  text: string;
  likeCount: number;
  deleted: boolean;        // note: matches Java 'deleted' field
  createdAt: string;
  updatedAt: string;
}

export type CommentPage = PageResult<CommentResponse>;

// ---- Likes ----

// Java: CommentLikeCreate
export interface CommentLikeCreate {
  userId: string;
  commentId: string;
}

// Java: CommentLikeResponse
export interface CommentLikeResponse {
  id: string;
  userId: string;
  commentId: string;
  createdAt: string;
}

// Optional aliases to match your original names if you want
export type Comment = CommentResponse;
export type CommentLike = CommentLikeResponse;


// export interface Comment {
//     id: string;
//     userId: string;
//     parentId: string | null;
//     subjectId: string;
//     subjectType: string;
//     text: string;
//     likeCount: number;
//     isDeleted: boolean;
//     createdAt: string;
//     updatedAt: string;
// }

// export interface CommentLike {
//     id: string;
//     userId: string;
//     commentId: string;
//     createdAt: string;
// }