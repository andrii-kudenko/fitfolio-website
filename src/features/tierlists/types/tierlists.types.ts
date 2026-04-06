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

// Java: record TierListCreateWithTiers(...)
export interface TierListCreateWithTiers {
  tierList: {
    title: string;
    description?: string | null;
    coverImageUrl?: string | null;
    isPublic?: boolean | null;
  };
  tiers: Array<{
    position: number;
    label?: string | null;
    name: string;
    color?: string | null;
    items: Array<{
      itemId: string;
      position: number;
    }>;
  }>;
  buffer: Array<{
    itemId: string;
    position: number;
  }>;
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
  saveCount: number;
  createdAt: string;
  updatedAt: string;
}

export type TierListPage = PageResult<TierListResponse>;

/** List payload from GET /users/{id}/tierlists — includes viewer flags when viewerUserId is sent. */
export interface TierListViewerResponse extends TierListResponse {
  isLiked: boolean;
  isSaved: boolean;
  isCommented: boolean;
}

export type TierListViewerPage = PageResult<TierListViewerResponse>;

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

// Java: record TierListSaveCreate(UUID userId, UUID tierListId)
export interface TierListSaveCreate {
  userId: string;
  tierListId: string;
}

// Java: record TierListSaveResponse(...)
export interface TierListSaveResponse {
  id: string;
  userId: string;
  tierListId: string;
  createdAt: string;
}

export type TierListSavedPage = PageResult<TierListResponse>;

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

export interface TierListWithTiers extends TierListViewerResponse {
  tiers: Array<{
    tier: TierResponse;
    items: Array<{
      id: string;
      imageUrl?: string;
    }>;
  }>;
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
  tierId: string | null; // Can be null for buffer items
  itemId: string;
  position: number;
  createdAt: string;
}

export type TierListItemPage = PageResult<TierListItemResponse>;

// ---------------------------------------------------------------------------
// TierListDetail DTO mirrors
// ---------------------------------------------------------------------------

// Java: record TierListDetailResponse(...)
export interface TierListDetailResponse {
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
  saveCount: number;
  createdAt: string;
  updatedAt: string;
  tiers: Array<{
    id: string;
    tierListId: string;
    label: string | null;
    name: string;
    color: string | null;
    position: number;
    items: Array<{
      id: string;
      tierListId: string;
      tierId: string;
      itemId: string;
      position: number;
      createdAt: string;
    }>;
  }>;
}



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

