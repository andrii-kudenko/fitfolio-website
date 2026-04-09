import type { CollectionSearchCardPayload, TierListSearchCardPayload } from "../types/listsSearch.types";
import type { CollectionWithItems } from "@/features/collections/types/collections.types";
import type { TierListWithTiers } from "@/features/tierlists/types/tierlists.types";

export function collectionSearchCardToWithItems(row: CollectionSearchCardPayload): CollectionWithItems {
  const { collection: c, topItems } = row;
  return {
    ...c,
    topItems: topItems.map((t) => ({
      id: String(t.id),
      imageUrl: t.imageUrl ?? undefined,
    })),
  };
}

export function tierListSearchCardToWithTiers(row: TierListSearchCardPayload): TierListWithTiers {
  const { tierList: tl, tiers } = row;
  return {
    ...tl,
    tiers: tiers.map((tw) => ({
      tier: tw.tier,
      items: tw.items.map((i) => ({
        id: String(i.id),
        imageUrl: i.imageUrl ?? undefined,
      })),
    })),
  };
}
