import { BrandResponse } from "@/features/brands/types/brands.types";
import { CategoryResponse } from "@/features/categories/types/categories.types";
import { PageResult, UserProfileResponse } from "@/features/users/types/users.types";

export interface ItemResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  slug: string;
  description: string;
  sourceUrl: string;
  subTitle?: string;
  fit?: string;
  materials?: string;
  department?: string;
  collection?: string;
  price?: number;
  details?: string[];
  name: string;
  brandId?: string;
  categoryId?: string;
  imageUrl?: string;
  contributorId?: string;
  commentCount: number;
  viewCount: number;
  likeCount: number;
  saveCount: number;
  primaryColor?: string;
  rating?: number;
}

/** List row from GET /users/{userId}/items when viewerUserId is sent. */
export interface ItemViewerResponse extends ItemResponse {
  isLiked: boolean;
  isSaved: boolean;
  isCommented: boolean;
}

export type ItemViewerPage = PageResult<ItemViewerResponse>;

/** Mirrors API {@code ItemUserEngagement} when {@code viewerUserId} is sent on full/detail. */
export interface ItemUserEngagement {
  isLiked: boolean;
  isSaved: boolean;
  isCommented: boolean;
  isReviewed: boolean;
}

export interface ItemFullResponse {
  item: ItemResponse;
  brand?: BrandResponse;
  category?: CategoryResponse;
  contributor?: UserProfileResponse;
  viewerEngagement?: ItemUserEngagement | null;
}

export type ItemPage = PageResult<ItemResponse>;
  // export type ItemPageFull = PageResult<ItemFullResponse>;

  // Create payload (mirror your ItemCreate DTO)
  export interface ItemCreate {
    name: string;
    status?: string;
    slug?: string; // probably generated on backend, so optional here
    description?: string | null;
    sourceUrl?: string | null;
    subTitle?: string | null;
    fit?: string | null;
    materials?: string | null;
    department?: string | null;
    collection?: string | null;
    price?: number | null;
    primaryColor?: string | null;
    rating?: number | null;
    brandId?: string | null;
    categoryId?: string | null;
    contributorId?: string | null;
    imageUrl?: string | null;
    details?: string[];
    // Enrichment metadata (from OpenAI)
    themesTags?: string[];
    occasionsTags?: string[];
    vibesTags?: string[];
    stylesTags?: string[];
    aestheticTags?: string[];
    fitTags?: string[];
    seasonTags?: string[];
    functionTags?: string[];
  }
  

export interface PageMeta {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

// ---- ItemLike mirrors ----

export interface ItemLikeCreate {
  userId: string;
  itemId: string;
}

export interface ItemLikeResponse {
  id: string;
  userId: string;
  itemId: string;
  createdAt: string;
}

/** Spring Data `Page<ItemResponse>` shape for saved items list */
export interface ItemSavedPage {
  content: ItemResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ---- ItemSave mirrors (explicit bookmark, not list membership) ----

export interface ItemSaveCreate {
  userId: string;
  itemId: string;
}

export interface ItemSaveResponse {
  id: string;
  userId: string;
  itemId: string;
  createdAt: string;
}