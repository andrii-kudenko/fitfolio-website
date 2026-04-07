"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Eye,
  MessageCircle,
  Shirt,
  HeartIcon,
  BookmarkIcon,
  User,
  ListIcon,
  ListOrderedIcon,
  ListTreeIcon,
  ListCollapseIcon,
} from "lucide-react";
import type { TierListWithTiers } from "@/features/tierlists/types/tierlists.types";
import { tierlistsApi } from "@/features/tierlists/api/tierlists.api";

function tierListPreviewSlots(
  tiers: TierListWithTiers["tiers"]
): Array<{ id: string; imageUrl?: string } | undefined> {
  const slots: Array<{ id: string; imageUrl?: string } | undefined> = [];
  for (const tw of tiers) {
    for (const item of tw.items) {
      if (slots.length >= 4) return slots;
      slots.push(item);
    }
  }
  while (slots.length < 4) slots.push(undefined);
  return slots;
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "k";
  }
  return count.toString();
}

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

export function TierListCard({
  tierList,
  username,
}: {
  tierList: TierListWithTiers;
  username: string;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(tierList.isLiked);
  const [likeCount, setLikeCount] = useState(tierList.likeCount ?? 0);
  const [liking, setLiking] = useState(false);
  const [saved, setSaved] = useState(tierList.isSaved);
  const [saveCount, setSaveCount] = useState(tierList.saveCount ?? 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLikeCount(tierList.likeCount ?? 0);
  }, [tierList.id, tierList.likeCount]);

  useEffect(() => {
    setSaveCount(tierList.saveCount ?? 0);
  }, [tierList.id, tierList.saveCount]);

  useEffect(() => {
    setUserId(readLoggedInUserId());
  }, []);

  useEffect(() => {
    setLiked(tierList.isLiked);
  }, [tierList.id, tierList.isLiked]);

  useEffect(() => {
    setSaved(tierList.isSaved);
  }, [tierList.id, tierList.isSaved]);

  const onLikeClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const uid = userId ?? readLoggedInUserId();
      if (!uid) {
        window.location.href = "/login";
        return;
      }
      if (liking) return;
      setLiking(true);
      try {
        if (liked) {
          await tierlistsApi.unlike(uid, tierList.id);
          setLiked(false);
          setLikeCount((c) => Math.max(0, c - 1));
        } else {
          await tierlistsApi.like({ userId: uid, tierListId: tierList.id });
          setLiked(true);
          setLikeCount((c) => c + 1);
        }
      } catch {
        // keep UI unchanged on failure
      } finally {
        setLiking(false);
      }
    },
    [userId, liked, liking, tierList.id]
  );

  const onBookmarkClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const uid = userId ?? readLoggedInUserId();
      if (!uid) {
        window.location.href = "/login";
        return;
      }
      if (saving) return;
      setSaving(true);
      try {
        if (saved) {
          await tierlistsApi.unsave(uid, tierList.id);
          setSaved(false);
          setSaveCount((c) => Math.max(0, c - 1));
        } else {
          await tierlistsApi.save({ userId: uid, tierListId: tierList.id });
          setSaved(true);
          setSaveCount((c) => c + 1);
        }
      } catch {
        // keep UI unchanged on failure
      } finally {
        setSaving(false);
      }
    },
    [userId, saved, saving, tierList.id]
  );

  const slots = tierListPreviewSlots(tierList.tiers);

  return (
    <Link
      href={`/${username}/tierlists/${tierList.slug}`}
      className=" group flex flex-col  focus:outline-none focus-visible:ring-2 focus-visible:ring-ff-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-3xl"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-white/10 transition-shadow duration-300 group-hover:ring-ff-cyan/35 ">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-black/40">
          {slots.map((item, i) => (
            <div
              key={item?.id ?? `empty-${i}`}
              className="relative min-h-0 overflow-hidden bg-slate-900"
            >
              {item?.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  className="object-cover brightness-[0.92] transition duration-300 group-hover:brightness-100"
                  sizes="(max-width: 768px) 50vw, 22vw"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-800/90" />
              )}
            </div>
          ))}
        </div>

        <div
          className="absolute bottom-[2px] left-[4px] flex  transition-all duration-300 justify-between gap-[2px]
                group-hover:opacity-0 z-10"
        >
          <div className="flex items-center gap-[3px] rounded-full bg-black/80 pl-1 pr-2 py-[3px]">
            <User className="size-3 text-white/50" strokeWidth={1.5} />
            <span className="text-[10px] text-white/50 sm:text-[10px]">{username}</span>
          </div>
        </div>

        <div
          className="absolute top-1/2 -translate-y-1/2 left-[1px] flex flex-col transition-all duration-300 justify-between gap-[2px] pl-1
                group-hover:opacity-0 bg-black/80 rounded-xl p-1 z-10"
        >
          <div className="w-1 h-3 shrink-0 bg-[#3B82F6]/80 rounded-full"></div>
          <div className="w-1 h-3 shrink-0 bg-[#10B981]/80 rounded-full"></div>
          <div className="w-1 h-3 shrink-0 bg-[#F59E0B]/80 rounded-full"></div>
          <div className="w-1 h-3 shrink-0 bg-[#F97316]/80 rounded-full"></div>
          <div className="w-1 h-3 shrink-0 bg-[#EF4444]/80 rounded-full"></div>
        </div>

        <div className="inset-0 absolute bg-black/10"></div>

        <div
          className="absolute bottom-[2px] right-[4px] flex  transition-all duration-300 justify-between gap-[2px]
                group-hover:opacity-0 z-10"
        >
          <div className="flex items-center gap-[3px] rounded-xl bg-black/30 px-1.5 py-[3px]">
            <Shirt className="size-3 text-white/50" strokeWidth={1.5} />
            <span className="text-white/50 text-[10px]">
              {formatCount(tierList.itemCount)}
            </span>
          </div>
          <div className="flex items-center gap-[3px] rounded-xl bg-black/30 px-1.5 py-[3px]">
            <Eye className="size-3 text-white/50" strokeWidth={1.5} />
            <span className="text-white/50 text-[10px]">
              {formatCount(tierList.viewCount)}
            </span>
          </div>
        </div>
      </div>

      <div
        className="  flex rounded-bl-xl transition-all duration-300 justify-start gap-2
              bg-black/80 p-2"
      >
        <button
          type="button"
          onClick={onLikeClick}
          disabled={liking}
          className="flex items-center gap-1 rounded-md p-0.5 -m-0.5 transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          aria-label={liked ? "Unlike tier list" : "Like tier list"}
          aria-pressed={liked}
        >
          <HeartIcon
            className={`size-3.5 sm:size-4 shrink-0 ${liked ? "fill-ff-cyan text-ff-cyan" : "text-ff-cyan"}`}
            strokeWidth={1.5}
          />         
          <span className="text-[12px] text-white sm:text-xs tabular-nums">
            {formatCount(likeCount)}
          </span>
        </button>

        <div className="flex items-center gap-1">
          <MessageCircle
            className={`size-3.5 sm:size-4 shrink-0 ${tierList.isCommented ? "fill-ff-cyan text-ff-cyan" : "text-ff-cyan"}`}
            strokeWidth={1.5}
          />
     
          <span className="text-[12px] text-white sm:text-xs">
            {formatCount(tierList.commentCount)}
          </span>
        </div>
        <button
          type="button"
          onClick={onBookmarkClick}
          disabled={saving}
          className="flex items-center gap-[2px] rounded-md p-0.5 -m-0.5 transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
          aria-label={saved ? "Remove from saved tier lists" : "Save tier list"}
          aria-pressed={saved}
        >
          <BookmarkIcon
            className={`size-3.5 sm:size-4 shrink-0 ${saved ? "fill-ff-cyan text-ff-cyan" : "text-ff-cyan"}`}
            strokeWidth={1.5}
          />
          <span className="text-[12px] text-white sm:text-xs tabular-nums">
            {formatCount(saveCount)}
          </span>
        </button>
      </div>

      <h3 className="line-clamp-2 text-start text-xs font-semibold leading-snug text-white px-2">
        {tierList.title}
      </h3>
    </Link>
  );
}
