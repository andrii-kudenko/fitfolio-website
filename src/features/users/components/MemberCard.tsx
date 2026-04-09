"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { usersApi } from "@/features/users/api/users.api";
import type { MemberSearchCard } from "@/features/search/types/membersSearch.types";

const PLACEHOLDER_AVATAR = "/nike-shoes.jpg";

export interface MemberCardProps {
  member: MemberSearchCard;
  /** Logged-in user id from `fitfolio_logged_in`, or null */
  currentUserId: string | null;
  /**
   * Optional parent callback after follow/unfollow succeeds.
   * Avoid full-list refetch here if it sets global loading — that will replace the grid and shift layout.
   */
  onFollowChange?: () => void;
  layout?: "grid" | "list";
}

export function MemberCard({
  member,
  currentUserId,
  onFollowChange,
  layout = "grid",
}: MemberCardProps) {
  const [following, setFollowing] = useState(member.following);
  const [followersCount, setFollowersCount] = useState(member.followersCount);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFollowing(member.following);
  }, [member.userId, member.following]);

  useEffect(() => {
    setFollowersCount(member.followersCount);
  }, [member.userId, member.followersCount]);

  const isSelf = currentUserId !== null && member.userId === currentUserId;

  const toggleFollow = useCallback(async () => {
    if (!currentUserId || isSelf || busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    try {
      if (next) {
        await usersApi.follow(member.userId);
        setFollowersCount((c) => c + 1);
      } else {
        await usersApi.unfollow(member.userId);
        setFollowersCount((c) => Math.max(0, c - 1));
      }
      onFollowChange?.();
    } catch {
      setFollowing(!next);
    } finally {
      setBusy(false);
    }
  }, [currentUserId, isSelf, busy, following, member.userId, onFollowChange]);

  const href = `/${encodeURIComponent(member.username)}`;
  const avatarSrc = member.avatarUrl?.trim() ? member.avatarUrl : PLACEHOLDER_AVATAR;

  const stats = (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/55 tabular-nums">
      <span>
        <span className="text-white/80 font-medium">{member.listsCount}</span> lists
      </span>
      <span>
        <span className="text-white/80 font-medium">{member.reviewsCount}</span> reviews
      </span>
      <span>
        <span className="text-white/80 font-medium">{followersCount}</span> followers
      </span>
    </div>
  );

  const followControl = isSelf ? (
    <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/45">
      You
    </span>
  ) : !currentUserId ? (
    <Link
      href="/login"
      className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
    >
      Sign in to follow
    </Link>
  ) : (
    <button
      type="button"
      disabled={busy}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFollow();
      }}
      className={
        following
          ? "inline-flex rounded-full border border-white/25 bg-transparent px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/10 disabled:opacity-50"
          : "inline-flex rounded-full bg-ff-cyan px-3 py-1.5 text-xs font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
      }
    >
      {busy ? "…" : following ? "Unfollow" : "Follow"}
    </button>
  );

  if (layout === "list") {
    return (
      <div className="flex min-w-0 items-center gap-4 rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <Link href={href} className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-white/10">
          <Image
            src={avatarSrc}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
            unoptimized
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={href} className="block truncate text-base font-semibold text-white hover:text-ff-cyan">
            @{member.username}
          </Link>
          {stats}
        </div>
        <div className="flex-shrink-0">{followControl}</div>
      </div>
    );
  }

  return (
    <article className="flex min-w-0 flex-col rounded-3xl bg-white/5 p-4 ring-1 ring-white/10 transition hover:ring-white/20">
      <div className="flex items-start gap-3">
        <Link
          href={href}
          className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-white/10"
        >
          <Image
            src={avatarSrc}
            alt=""
            fill
            className="object-cover"
            sizes="56px"
            unoptimized
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={href}
            className="block truncate text-[15px] font-semibold text-white hover:text-ff-cyan"
          >
            @{member.username}
          </Link>
          {stats}
        </div>
      </div>
      <div className="mt-4 flex justify-end">{followControl}</div>
    </article>
  );
}
