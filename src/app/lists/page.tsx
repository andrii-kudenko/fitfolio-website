"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
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

  const handleInputChange = (value: string) => {
    setInput(value);
    if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
    urlDebounceRef.current = setTimeout(() => {
      urlDebounceRef.current = null;
      const params = new URLSearchParams();
      const trimmed = value.trim();
      if (trimmed) params.set("q", trimmed);
      const qs = params.toString();
      router.replace(qs ? `/lists?${qs}` : "/lists");
    }, 150);
  };

  const collections = data?.collections ?? [];
  const tierLists = data?.tierLists ?? [];
  const hasQuery = qParam.trim().length > 0;
  const hasResults = collections.length > 0 || tierLists.length > 0;

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

        {!hasQuery && (
          <div className="text-center py-16 text-white/60 text-sm">
            Type a name to find public collections and tier lists.
          </div>
        )}

        {hasQuery && isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="min-w-0 min-h-[260px] bg-white/5 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        )}

        {hasQuery && !isLoading && !hasResults && (
          <div className="text-center py-16 text-white/60 text-sm">
            No collections or tier lists matched &ldquo;{qParam.trim()}&rdquo;.
          </div>
        )}

        {hasQuery && !isLoading && hasResults && (
          <div className="space-y-10">
            {collections.length > 0 && (
              <section>
                <h2 className="text-white/80 text-sm font-medium uppercase tracking-wide mb-4">
                  Collections ({collections.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {collections.map((row) => {
                    const col = collectionSearchCardToWithItems(row);
                    return (
                      <CollectionCard
                        key={col.id}
                        layout="grid"
                        collection={col}
                        username={row.ownerUsername}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {tierLists.length > 0 && (
              <section>
                <h2 className="text-white/80 text-sm font-medium uppercase tracking-wide mb-4">
                  Tier lists ({tierLists.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {tierLists.map((row) => {
                    const tl = tierListSearchCardToWithTiers(row);
                    return (
                      <TierListCard
                        key={tl.id}
                        layout="grid"
                        tierList={tl}
                        username={row.ownerUsername}
                      />
                    );
                  })}
                </div>
              </section>
            )}
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
