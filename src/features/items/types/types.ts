import { Brand } from "@/features/brands/types/types";
import { Category } from "@/features/categories/types/types";
import { UserWithProfileDTO } from "@/features/user/types/types";

export interface Item {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  slug: string;
  description: string;
  source_url: string;
  sub_title?: string;
  fit?: string;
  materials?: string;
  department?: string;
  collection?: string;
  price?: number;
  details?: string[];
  title: string;
  brand_id?: string;
  category_id?: string;
  image_url?: string;
  contributor_id?: string;
  comment_count: number;
  view_count: number;
  like_count: number;
  primary_color?: string;
  rating?: number;
  }

export interface ItemLike {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
}
  
export interface CreateItemDTO {
  name: string;
  brand: string;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
}

export interface ItemResponseDTO extends Item {
  brand?: Brand;
  category?: Category;
  contributor?: UserWithProfileDTO;
}