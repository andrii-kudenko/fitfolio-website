"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { collectionsApi } from "@/features/collections/api/collections.api";
import type { CollectionWithItems } from "@/features/collections/types/collections.types";
import { itemsApi } from "@/features/items/api/items.api";
import { CollectionCard } from "@/features/collections/components/CollectionCard";

export function CollectionsTab({ userId, username }: { userId: string; username: string }) {
  const [collections, setCollections] = useState<CollectionWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      try {
        setLoading(true);
        const collectionsPage = await collectionsApi.getForUser(userId, {
          size: 20,
        });

        const collectionsWithItems = await Promise.all(
          collectionsPage.content.map(async (collection) => {
            try {
              const itemsPage = await collectionsApi.getItems(collection.id, {
                size: 4,
                sort: collection.isRanked ? "rank,asc" : "createdAt,asc",
              });

              const topItems = await Promise.all(
                itemsPage.content.slice(0, 4).map(async (collectionItem) => {
                  try {
                    const itemDetails = await itemsApi.getById(collectionItem.itemId);
                    return {
                      id: itemDetails.id,
                      imageUrl: itemDetails.imageUrl,
                    };
                  } catch {
                    return {
                      id: collectionItem.itemId,
                      imageUrl: undefined,
                    };
                  }
                })
              );

              return {
                ...collection,
                topItems,
              };
            } catch {
              return {
                ...collection,
                topItems: [],
              };
            }
          })
        );

        setCollections(collectionsWithItems);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchCollections();
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
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} username={username} />
      ))}
      <Link
        href="/collections/new"
        className="group flex flex-col rounded-2xl border border-dashed border-slate-800 bg-slate-950/80 p-4 items-center justify-center cursor-pointer
         hover:border-ff-cyan transition-all duration-300"
      >
        <Plus
          className="size-[140px] text-ff-gray opacity-50 group-hover:opacity-100 group-hover:text-ff-cyan transition-all duration-300"
          strokeWidth={0.5}
        />
        <h3 className="font-medium text-ff-gray opacity-50 group-hover:opacity-100 group-hover:text-ff-cyan transition-all duration-300">
          Create new Collection
        </h3>
      </Link>
    </div>
  );
}
