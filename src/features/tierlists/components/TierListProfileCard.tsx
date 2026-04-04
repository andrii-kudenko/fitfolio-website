import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  MessageCircle,
  Shirt,
  HeartIcon,
  BookmarkIcon,
  User,
} from "lucide-react";
import type { TierListWithTiers } from "@/features/tierlists/types/tierlists.types";

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

export function TierListProfileCard({
  tierList,
  username,
}: {
  tierList: TierListWithTiers;
  username: string;
}) {
  const slots = tierListPreviewSlots(tierList.tiers);

  const likeLabel =
    tierList.likeCount >= 1000
      ? (tierList.likeCount / 1000).toFixed(1) + "k"
      : String(tierList.likeCount);

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
          className="absolute top-[0px] left-[0px] flex  transition-all duration-300 justify-between gap-[2px]
                group-hover:opacity-0 "
        >
          <div className="flex items-center gap-[3px] rounded-br-xl bg-black/80 px-1.5 py-[3px]">
            <User className="size-3 text-white/50" strokeWidth={1.5} />
            <span className="text-[10px] text-white/50 sm:text-[10px]">{username}</span>
          </div>
        </div>

        <div
          className="absolute bottom-[1px] right-[1px] flex  transition-all duration-300 justify-between gap-[2px]
                group-hover:opacity-0 "
        >
          <div className="flex items-center gap-[3px] rounded-xl bg-black/30 px-1.5 py-[3px]">
            <Shirt className="size-3 text-white/50" strokeWidth={1.5} />
            <span className="text-xs text-white/50 sm:text-[10px]">
              {formatCount(tierList.itemCount)}
            </span>
          </div>
          <div className="flex items-center gap-[3px] rounded-xl bg-black/30 px-1.5 py-[3px]">
            <Eye className="size-3 text-white/50" strokeWidth={1.5} />
            <span className="text-xs text-white/50 sm:text-[10px]">
              {formatCount(tierList.viewCount)}
            </span>
          </div>
        </div>
      </div>

      <div
        className="  flex rounded-bl-xl transition-all duration-300 justify-start gap-2
              bg-black/80 p-2"
      >
        <div className="flex items-center gap-1">
          <HeartIcon className="size-3.5 text-ff-cyan sm:size-4.5" strokeWidth={1.5} />
          <span className="text-[12px] text-white sm:text-xs">{likeLabel}</span>
        </div>

        <div className="flex items-center gap-1">
          <MessageCircle className="size-3.5 text-ff-cyan sm:size-4.5" strokeWidth={1.5} />
          <span className="text-[12px] text-white sm:text-xs">
            {formatCount(tierList.commentCount)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <BookmarkIcon className="size-3.5 text-ff-cyan sm:size-4.5" strokeWidth={1.5} />
          <span className="text-[12px] text-white sm:text-xs">
            {formatCount(tierList.viewCount)}
          </span>
        </div>
      </div>

      <h3 className="line-clamp-2 text-start text-xs font-semibold leading-snug text-white px-2">
        {tierList.title}
      </h3>
    </Link>
  );
}
