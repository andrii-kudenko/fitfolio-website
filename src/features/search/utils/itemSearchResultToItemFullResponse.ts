import type { ItemSearchResult } from "../types/search.types";
import type { ItemFullResponse, ItemResponse } from "@/features/items/types/items.types";

/**
 * Maps ItemSearchResult (flat) to ItemFullResponse for use with ItemCard.
 * Brand/category are not returned by search, so they're undefined.
 */
export function itemSearchResultToItemFullResponse(
  r: ItemSearchResult
): ItemFullResponse {
  const item: ItemResponse = {
    id: r.id,
    createdAt: r.createdAt ?? "",
    updatedAt: r.updatedAt ?? "",
    status: r.status ?? "published",
    slug: r.slug,
    name: r.name,
    subTitle: r.subTitle,
    description: r.description ?? "",
    sourceUrl: r.sourceUrl ?? "",
    fit: r.fit,
    materials: r.materials,
    department: r.department,
    collection: r.collection,
    price: r.price,
    primaryColor: r.primaryColor,
    rating: r.rating,
    brandId: r.brandId,
    categoryId: r.categoryId,
    contributorId: r.contributorId,
    imageUrl: r.imageUrl,
    commentCount: r.commentCount ?? 0,
    viewCount: r.viewCount ?? 0,
    likeCount: r.likeCount ?? 0,
    details: r.details,
  };
  return { item, brand: undefined, category: undefined };
}
