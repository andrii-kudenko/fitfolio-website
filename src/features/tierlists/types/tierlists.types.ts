import type { PageResult } from "@/shared/types/pagination";

// ---------------------------------------------------------------------------
// TierList DTO mirrors
// ---------------------------------------------------------------------------

// Java: record TierListCreate(String title, String description, String coverImageUrl, Boolean isPublic)
export interface TierListCreate {
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  isPublic?: boolean | null;
}

// Java: record TierListResponse(...)
// Matches your original TierList interface shape
export interface TierListResponse {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  likeCount: number;
  commentCount: number;
  itemCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export type TierListPage = PageResult<TierListResponse>;

// ---------------------------------------------------------------------------
// TierListLike DTO mirrors
// ---------------------------------------------------------------------------

// Java: record TierListLikeCreate(UUID userId, UUID tierListId)
export interface TierListLikeCreate {
  userId: string;
  tierListId: string;
}

// Java: record TierListLikeResponse(UUID id, UUID userId, UUID tierListId, OffsetDateTime createdAt)
export interface TierListLikeResponse {
  id: string;
  userId: string;
  tierListId: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Tier DTO mirrors
// ---------------------------------------------------------------------------

// Java: record TierCreate(Integer position, String label, String name, String color)
export interface TierCreate {
  position: number;
  label?: string | null;
  name: string;
  color?: string | null;
}

// Java: record TierResponse(UUID id, UUID tierListId, String label, String name, String color, int position)
export interface TierResponse {
  id: string;
  tierListId: string;
  label: string | null;
  name: string;
  color: string | null;
  position: number;
}

// ---------------------------------------------------------------------------
// TierListItem DTO mirrors
// ---------------------------------------------------------------------------

// Java: record TierListItemCreate(UUID tierListId, UUID tierId, UUID itemId, Integer position)
export interface TierListItemCreate {
  tierListId: string;
  tierId: string;
  itemId: string;
  position: number;
}

// Java: record TierListItemResponse(UUID id, UUID tierListId, UUID tierId,
//                                  UUID itemId, int position, OffsetDateTime createdAt)
export interface TierListItemResponse {
  id: string;
  tierListId: string;
  tierId: string;
  itemId: string;
  position: number;
  createdAt: string;
}

export type TierListItemPage = PageResult<TierListItemResponse>;



// export interface TierList {
//     id: string;
//     userId: string;
//     title: string;
//     slug: string;
//     description: string;
//     coverImageUrl: string;
//     isPublic: boolean;
//     likeCount: number;
//     commentCount: number;
//     itemCount: number;
//     viewCount: number;
//     createdAt: string;
//     updatedAt: string;
// }

// export interface TierListLike {
//     id: string;
//     userId: string;
//     tierListId: string;
//     createdAt: string;
// }

// export interface Tier {
//     id: string;
//     tierListId: string;
//     label: string;
//     name: string;
//     color: string;
//     position: number;
// }

// export interface TierListItem {
//     id: string;
//     tierListId: string;
//     tierId: string;
//     itemId: string;
//     position: number;
//     createdAt: string;
// }

