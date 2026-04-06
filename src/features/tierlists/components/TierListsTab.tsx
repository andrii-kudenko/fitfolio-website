"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { tierlistsApi } from "@/features/tierlists/api/tierlists.api";
import type { TierListWithTiers } from "@/features/tierlists/types/tierlists.types";
import { itemsApi } from "@/features/items/api/items.api";
import { TierListCard } from "@/features/tierlists/components/TierListCard";

function readLoggedInUserId(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("fitfolio_logged_in");
  if (!raw) return null;
  try {
    const u = JSON.parse(raw) as { id?: string };
    return typeof u?.id === "string" ? u.id : null;
  } catch {
    return null;
  }
}

export function TierListsTab({ userId, username }: { userId: string; username: string }) {
  const [tierLists, setTierLists] = useState<TierListWithTiers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTierLists() {
      try {
        setLoading(true);
        const viewerUserId = readLoggedInUserId();
        const tierListsPage = await tierlistsApi.getForUser(userId, {
          size: 20,
          ...(viewerUserId ? { viewerUserId } : {}),
        });

        const tierListsWithTiers = await Promise.all(
          tierListsPage.content.map(async (tierList) => {
            try {
              const tiers = await tierlistsApi.getTiers(tierList.id);

              const sortedTiers = tiers.sort((a, b) => a.position - b.position);

              const tiersWithItems = await Promise.all(
                sortedTiers.slice(0, 2).map(async (tier) => {
                  try {
                    const itemsPage = await tierlistsApi.getItems(tierList.id, {
                      size: 50,
                      sort: "position,asc",
                    });

                    const tierItems = itemsPage.content
                      .filter((item) => item.tierId === tier.id)
                      .slice(0, 3);

                    const itemsWithDetails = await Promise.all(
                      tierItems.map(async (tierItem) => {
                        try {
                          const itemDetails = await itemsApi.getById(tierItem.itemId);
                          return {
                            id: itemDetails.id,
                            imageUrl: itemDetails.imageUrl,
                          };
                        } catch {
                          return {
                            id: tierItem.itemId,
                            imageUrl: undefined,
                          };
                        }
                      })
                    );

                    return {
                      tier,
                      items: itemsWithDetails,
                    };
                  } catch {
                    return {
                      tier,
                      items: [],
                    };
                  }
                })
              );

              return {
                ...tierList,
                tiers: tiersWithItems,
              };
            } catch {
              return {
                ...tierList,
                tiers: [],
              };
            }
          })
        );

        setTierLists(tierListsWithTiers);
      } catch (error) {
        console.error("Error fetching tier lists:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchTierLists();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex flex-col gap-3 animate-pulse">
            <div className="aspect-square overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-px bg-slate-800/80">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-slate-800" />
                ))}
              </div>
            </div>
            <div className="h-5 w-4/5 rounded-md bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
      {tierLists.map((tierList) => (
        <TierListCard key={tierList.id} tierList={tierList} username={username} />
      ))}
      <Link
        href="/tierlists/new"
        className="group flex flex-col rounded-2xl border border-dashed border-slate-800 bg-slate-950/80 p-4 items-center justify-center cursor-pointer
         hover:border-ff-cyan transition-all duration-300"
      >
        <Plus
          className="size-[140px] text-ff-gray opacity-50 group-hover:opacity-100 group-hover:text-ff-cyan transition-all duration-300"
          strokeWidth={0.5}
        />
        <h3 className="font-medium text-ff-gray opacity-50 group-hover:opacity-100 group-hover:text-ff-cyan transition-all duration-300">
          Create new Tier-list
        </h3>
      </Link>
    </div>
  );
}
