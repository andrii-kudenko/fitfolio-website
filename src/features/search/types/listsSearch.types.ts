import type { CollectionViewerResponse } from "@/features/collections/types/collections.types";
import type { TierListViewerResponse, TierResponse } from "@/features/tierlists/types/tierlists.types";

/** GET /api/search/collections-and-tierlists — preview line item */
export interface ListsSearchPreviewItem {
  id: string;
  imageUrl: string | null;
}

export interface CollectionSearchCardPayload {
  collection: CollectionViewerResponse;
  ownerUsername: string;
  topItems: ListsSearchPreviewItem[];
}

export interface TierWithPreviewItemsPayload {
  tier: TierResponse;
  items: ListsSearchPreviewItem[];
}

export interface TierListSearchCardPayload {
  tierList: TierListViewerResponse;
  ownerUsername: string;
  tiers: TierWithPreviewItemsPayload[];
}

export interface CollectionsAndTierListsSearchResponse {
  collections: CollectionSearchCardPayload[];
  tierLists: TierListSearchCardPayload[];
}
