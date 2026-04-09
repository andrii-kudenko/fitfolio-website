"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { useListsSearch } from "@/features/search/hooks/useListsSearch";
import {
  collectionSearchCardToWithItems,
  tierListSearchCardToWithTiers,
} from "@/features/search/utils/listsSearchMappers";
import { CollectionCard } from "@/features/collections/components/CollectionCard";
import { TierListCard } from "@/features/tierlists/components/TierListCard";

function ListsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const [input, setInput] = useState(qParam);
  const urlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInput(qParam);
  }, [qParam]);

  useEffect(() => {
    return () => {
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
    };
  }, []);

  const { data, isLoading, error } = useListsSearch(qParam);


  const results = data?.results ?? [];
  const hasQuery = qParam.trim().length > 0;
  const hasResults = results.length > 0;

  console.log("Hello from ListsPageContent");

  return (
    <main className="bg-black text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white underline">Lists</span>
          </div>
        </nav>



        {error && <div className="text-red-400 text-sm mb-4">{error}</div>}

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="min-w-0 min-h-[260px] bg-white/5 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        )}

        {!isLoading && !hasResults && !hasQuery && (
          <div className="text-center py-16 text-white/60 text-sm">
            No public collections or tier lists yet.
          </div>
        )}

        {!isLoading && !hasResults && hasQuery && (
          <div className="text-center py-16 text-white/60 text-sm">
            No collections or tier lists matched &ldquo;{qParam.trim()}&rdquo;.
          </div>
        )}

        {!isLoading && hasResults && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {results.map((row) => {
              if (row.kind === "COLLECTION" && row.collection) {
                const payload = row.collection;
                const col = collectionSearchCardToWithItems(payload);
                return (
                  <div key={`c-${col.id}`} className="relative min-w-0">
                    {/* {hasQuery && (
                      <span
                        className="pointer-events-none absolute -top-1 right-0 z-20 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-ff-cyan/90 ring-1 ring-white/10"
                        title="Match strength"
                      >
                        {Math.round(row.relevanceScore * 100)}%
                      </span>
                    )} */}
                    <CollectionCard
                      layout="grid"
                      collection={col}
                      username={payload.ownerUsername}
                    />
                  </div>
                );
              }
              if (row.kind === "TIER_LIST" && row.tierList) {
                const payload = row.tierList;
                const tl = tierListSearchCardToWithTiers(payload);
                return (
                  <div key={`t-${tl.id}`} className="relative min-w-0">
                    {/* {hasQuery && (
                      <span
                        className="pointer-events-none absolute -top-1 right-0 z-20 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-ff-cyan/90 ring-1 ring-white/10"
                        title="Match strength"
                      >
                        {Math.round(row.relevanceScore * 100)}%
                      </span>
                    )} */}
                    <TierListCard layout="grid" tierList={tl} username={payload.ownerUsername} />
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ListsPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-black text-white pt-8">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="h-96 animate-pulse bg-white/5 rounded-lg" />
          </div>
        </main>
      }
    >
      <ListsPageContent />
    </Suspense>
  );
}
