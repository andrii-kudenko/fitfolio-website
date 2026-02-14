/**
 * Search result type matching the backend ItemSearchResult DTO
 */
export interface ItemSearchResult {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  slug: string;
  name: string;
  subTitle?: string;
  description?: string;
  sourceUrl?: string;
  fit?: string;
  materials?: string;
  department?: string;
  collection?: string;
  price?: number;
  primaryColor?: string;
  rating?: number;
  brandId?: string;
  categoryId?: string;
  contributorId?: string;
  imageUrl?: string;
  commentCount?: number;
  viewCount?: number;
  likeCount?: number;
  details?: string[];
  similarity: number;
}

export type SearchSort =
  | "RELEVANCE"
  | "POPULARITY_VIEWS"
  | "POPULARITY_LIKES"
  | "DATE_ADDED"
  | "RATING";

export interface FacetValue<T> {
  value: T;
  count: number;
}

export interface SearchFacetsResponse {
  brands: FacetValue<string>[];
  categories: FacetValue<string>[];
  colors: FacetValue<string>[];
  minPrice: number | null;
  maxPrice: number | null;
}

export interface SearchState {
  query: string;
  selectedBrandIds: string[];
  selectedCategoryIds: string[];
  selectedColors: string[];
  minPrice?: number;
  maxPrice?: number;
  sort: SearchSort;
  page: number;
  limit: number;
}
