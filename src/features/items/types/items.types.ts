import { Brand } from "@/features/brands/types/types";
import { Category } from "@/features/categories/types/types";
import { UserProfileResponse } from "@/features/user/types/users.types";

export interface Item {
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

export interface ItemLike {
  id: string;
  userId: string;
  itemId: string;
  createdAt: string;
}
  
export interface ItemCreate {
  name: string;
  brand: string;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
}

export interface ItemResponse extends Item {
  brand?: Brand;
  category?: Category;
  contributor?: UserProfileResponse;
}

export interface PageMeta {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface ItemPage {
  content: Item[];
  page: PageMeta;
}