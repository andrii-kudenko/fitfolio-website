import type { PageResult } from "@/shared/types/pagination";

// ----- Collections -----

export interface CollectionCreate {
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  isPublic?: boolean | null;
  isRanked?: boolean | null;
}

export interface CollectionResponse {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  isRanked: boolean;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CollectionPage = PageResult<CollectionResponse>;

// ----- Likes -----

export interface CollectionLikeCreate {
  userId: string;
  collectionId: string;
}

export interface CollectionLikeResponse {
  id: string;
  userId: string;
  collectionId: string;
  createdAt: string;
}

// ----- Items -----

export interface CollectionItemCreate {
  collectionId: string;
  itemId: string;
  rank?: number | null;
}

export interface CollectionItemResponse {
  id: string;
  collectionId: string;
  itemId: string;
  rank: number | null;
  createdAt: string;
}

export type CollectionItemPage = PageResult<CollectionItemResponse>;




// export interface Collection {
//     id: string;
//     userId: string;
//     title: string;
//     slug: string;
//     description: string;
//     coverImageUrl: string;
//     isPublic: boolean;
//     isRanked: boolean;
//     likeCount: number;
//     commentCount: number;
//     viewCount: number;
//     itemCount: number;
//     createdAt: string;
//     updatedAt: string;
// }

// export interface CollectionLike {
//     id: string;
//     userId: string;
//     collectionId: string;
//     createdAt: string;
// }

// export interface CollectionItem {
//     id: string;
//     collectionId: string;
//     itemId: string;
//     rank: number;
//     createdAt: string;
// }

