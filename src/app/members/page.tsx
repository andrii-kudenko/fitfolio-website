"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useMembersSearch } from "@/features/search/hooks/useMembersSearch";
import { MemberCard } from "@/features/users/components/MemberCard";

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

function MembersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const [input, setInput] = useState(qParam);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const urlDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInput(qParam);
  }, [qParam]);

  useEffect(() => {
    setCurrentUserId(readLoggedInUserId());
  }, [qParam]);

  useEffect(() => {
    return () => {
      if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
    };
  }, []);

  const { data, isLoading, error } = useMembersSearch(qParam);

  const results = data?.results ?? [];
  const hasQuery = qParam.trim().length > 0;
  const hasResults = results.length > 0;

  return (
    <main className="bg-black text-white pt-8">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-6 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white underline">Members</span>
          </div>
        </nav>

        {/* Inline fallback search when navbar panel is closed */}
        <div className="mb-8 md:hidden">
          <label className="sr-only" htmlFor="members-search-inline">
            Search members
          </label>
          <input
            id="members-search-inline"
            type="search"
            placeholder="Search by username…"
            className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-ff-cyan"
            value={input}
            onChange={(e) => {
              const v = e.target.value;
              setInput(v);
              if (urlDebounceRef.current) clearTimeout(urlDebounceRef.current);
              urlDebounceRef.current = setTimeout(() => {
                urlDebounceRef.current = null;
                const params = new URLSearchParams();
                if (v.trim()) params.set("q", v.trim());
                const qs = params.toString();
                router.replace(qs ? `/members?${qs}` : "/members");
              }, 200);
            }}
          />
        </div>

        {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="min-h-[180px] rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && !hasResults && !hasQuery && (
          <div className="py-16 text-center text-sm text-white/60">
            No member profiles to show yet.
          </div>
        )}

        {!isLoading && !hasResults && hasQuery && (
          <div className="py-16 text-center text-sm text-white/60">
            No members matched &ldquo;{qParam.trim()}&rdquo;.
          </div>
        )}

        {!isLoading && hasResults && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {results.map((member) => (
              <MemberCard
                key={member.userId}
                member={member}
                currentUserId={currentUserId}
                layout="grid"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function MembersPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-black text-white pt-8">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="h-96 animate-pulse rounded-lg bg-white/5" />
          </div>
        </main>
      }
    >
      <MembersPageContent />
    </Suspense>
  );
}
