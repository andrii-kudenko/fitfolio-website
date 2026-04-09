import type { CollectionViewerResponse } from "@/features/collections/types/collections.types";
import type { TierListViewerResponse, TierResponse } from "@/features/tierlists/types/tierlists.types";

/** Preview tile for collection / tier-list cards */
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

/** GET /api/search/collections-and-tierlists/unified */
export type ListsSearchKind = "COLLECTION" | "TIER_LIST";

export interface ListsSearchRow {
  kind: ListsSearchKind;
  relevanceScore: number;
  collection?: CollectionSearchCardPayload;
  tierList?: TierListSearchCardPayload;
}

export interface ListsSearchResponse {
  results: ListsSearchRow[];
}
