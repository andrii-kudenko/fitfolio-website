"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usersApi } from "@/features/users/api/users.api";
import type { UserWithProfilesResponse } from "@/features/users/types/users.types";

export function ProfileFollowList({
  profileUserId,
  mode,
}: {
  profileUserId: string;
  mode: "followers" | "following";
}) {
  const [rows, setRows] = useState<UserWithProfilesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const page =
          mode === "followers"
            ? await usersApi.getFollowers(profileUserId, { size: 50 })
            : await usersApi.getFollowing(profileUserId, { size: 50 });
        if (!cancelled) setRows(page.content ?? []);
      } catch {
        if (!cancelled) {
          setError("Failed to load list");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [profileUserId, mode]);

  if (loading) {
    return <div className="text-sm text-slate-400">Loading…</div>;
  }
  if (error) {
    return <div className="text-sm text-red-400">{error}</div>;
  }
  if (rows.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        {mode === "followers" ? "No followers yet." : "Not following anyone yet."}
      </p>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <ProfileFollowRow key={row.user.id} row={row} />
      ))}
    </div>
  );
}

function ProfileFollowRow({ row }: { row: UserWithProfilesResponse }) {
  const p = row.profile;
  const display = p
    ? `@${p.username}`
    : `${row.user.firstName} ${row.user.lastName}`.trim() || row.user.email;
  const avatar = p?.avatarUrl || "/face.jpg";
  const href = p ? `/${encodeURIComponent(p.username)}` : null;

  const body = (
    <>
      <img
        src={avatar}
        alt=""
        className="h-12 w-12 shrink-0 rounded-full bg-slate-800 object-cover"
      />
      <div className="min-w-0">
        <div className="truncate font-medium text-slate-100">{display}</div>
        {p ? (
          <div className="text-[11px] text-slate-400">
            {p.followersCount} followers · {p.followingCount} following
          </div>
        ) : (
          <div className="text-[11px] text-slate-500">No public profile</div>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-3 transition hover:border-slate-600"
      >
        {body}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-3">
      {body}
    </div>
  );
}
