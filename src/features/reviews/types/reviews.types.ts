import type { PageResult } from "@/shared/types/pagination";

// ---- Reviews ----

// Java: ReviewCreate
export interface ReviewCreate {
  userId: string;
  itemId: string;
  title?: string | null;
  text?: string | null;
  rating?: number | null;          // BigDecimal -> number
  fit?: string | null;
  comfort?: string | null;
  quality?: string | null;
  timeOwned?: string | null;
  purchasedSize?: string | null;
  wearFrequency?: string | null;
  climate?: string | null;
  wouldRecommend?: boolean | null;
  wouldBuyAgain?: boolean | null;
  tags?: string[] | null;
}

// Java: ReviewResponse
export interface ReviewResponse {
  id: string;
  userId: string;
  itemId: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  likeCount: number;
  title: string | null;
  text: string | null;
  rating: number | null;
  fit: string | null;
  comfort: string | null;
  quality: string | null;
  timeOwned: string | null;
  purchasedSize: string | null;
  wearFrequency: string | null;
  climate: string | null;
  wouldRecommend: boolean;
  wouldBuyAgain: boolean;
  tags: string[];
}

export type ReviewPage = PageResult<ReviewResponse>;

// Optional alias to keep your old name
export type Review = ReviewResponse;

// ---- Media ----

// Java: ReviewMediaCreate
export interface ReviewMediaCreate {
  reviewId: string;
  url: string;
  type: string;
  sortOrder?: number | null;
}

// Java: ReviewMediaResponse
export interface ReviewMediaResponse {
  id: string;
  reviewId: string;
  url: string;
  type: string;
  sortOrder: number;
  createdAt: string;
}

export type ReviewMedia = ReviewMediaResponse;

// ---- Likes ----

// Java: ReviewLikeCreate
export interface ReviewLikeCreate {
  userId: string;
  reviewId: string;
}

// Java: ReviewLikeResponse
export interface ReviewLikeResponse {
  id: string;
  userId: string;
  reviewId: string;
  createdAt: string;
}

export type ReviewLike = ReviewLikeResponse;


// export interface Review {
//     id: string;
//     userId: string;
//     itemId: string;
//     createdAt: string;
//     updatedAt: string;
//     isVerified: boolean;
//     likeCount: number;
//     title: string;
//     text: string;
//     rating: number;
//     fit: string;
//     comfort: string;
//     quality: string;
//     timeOwned: string;
//     purchasedSize: string;
//     wearFrequency: string;
//     climate: string;
//     wouldRecommend: boolean;
//     wouldBuyAgain: boolean;
//     tags: string[];
// }

// export interface ReviewMeida {
//     id: string;
//     reviewId: string;
//     url: string;
//     type: string;
//     sortOrder: number;
//     createdAt: string;
// }

// export interface ReviewLike {
//     id: string;
//     userId: string;
//     reviewId: string;
//     createdAt: string;
// }