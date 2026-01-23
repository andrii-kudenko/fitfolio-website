/**
 * Search result type matching the backend ItemSearchResult DTO
 */
export interface ItemSearchResult {
  id: string; // UUID as string
  name: string;
  slug: string;
  imageUrl?: string;
  price?: number; // BigDecimal as number
  rating?: number; // BigDecimal as number
  department?: string;
  similarity: number; // double as number
  subTitle?: string;
  description?: string;
}

