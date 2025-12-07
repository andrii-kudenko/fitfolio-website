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
  primaryColor?: string;
  rating?: number;
}

export interface ItemResponseFull extends ItemResponse {
  brand?: BrandResponse;
  category?: CategoryResponse;
  contributor?: UserProfileResponse;
}

  export type ItemPage = PageResult<ItemResponse>;

  // Create payload (mirror your ItemCreate DTO)
  export interface ItemCreate {
    name: string;
    status: string;
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