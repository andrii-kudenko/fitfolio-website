'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Star, Eye, MessageCircle, HeartIcon, BookmarkIcon } from 'lucide-react';
import { ItemFullResponse, ItemViewerResponse } from '../types/items.types';

function isItemViewerRow(item: ItemFullResponse['item']): item is ItemViewerResponse {
  return (
    'isLiked' in item &&
    'isSaved' in item &&
    'isCommented' in item &&
    typeof (item as ItemViewerResponse).isLiked === 'boolean'
  );
}
import Link from 'next/link';
import { itemsApi } from '../api/items.api';

interface ItemCardProps {
  item: ItemFullResponse;
  /** Use `"grid"` when the card sits in CSS grid/flex tracks so it fills the cell and can shrink. `"scroll"` keeps a fixed card width for horizontal lists. */
  layout?: 'grid' | 'scroll';
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toString();
}

function readLoggedInUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('fitfolio_logged_in');
  if (!raw) return null;
  try {
    const u = JSON.parse(raw) as { id?: string };
    return typeof u?.id === 'string' ? u.id : null;
  } catch {
    return null;
  }
}

export default function ItemCard({ item, layout = 'scroll' }: ItemCardProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(() =>
    isItemViewerRow(item.item)
      ? item.item.isLiked
      : (item.viewerEngagement?.isLiked ?? false)
  );
  const [likeCount, setLikeCount] = useState(item.item.likeCount ?? 0);
  const [liking, setLiking] = useState(false);
  const [saved, setSaved] = useState(() =>
    isItemViewerRow(item.item)
      ? item.item.isSaved
      : (item.viewerEngagement?.isSaved ?? false)
  );
  const [saveCount, setSaveCount] = useState(item.item.saveCount ?? 0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLikeCount(item.item.likeCount ?? 0);
  }, [item.item.id, item.item.likeCount]);

  useEffect(() => {
    setSaveCount(item.item.saveCount ?? 0);
  }, [item.item.id, item.item.saveCount]);

  useEffect(() => {
    setUserId(readLoggedInUserId());
  }, []);

  const viewerRow = isItemViewerRow(item.item) ? item.item : null;
  useEffect(() => {
    if (!viewerRow) return;
    setLiked(viewerRow.isLiked);
    setSaved(viewerRow.isSaved);
  }, [viewerRow?.id, viewerRow?.isLiked, viewerRow?.isSaved]);

  useEffect(() => {
    if (isItemViewerRow(item.item)) return;
    const e = item.viewerEngagement;
    if (!e) return;
    setLiked(e.isLiked);
    setSaved(e.isSaved);
  }, [item.item.id, item.viewerEngagement]);

  useEffect(() => {
    if (isItemViewerRow(item.item) || item.viewerEngagement != null) return;
    const uid = userId;
    if (!uid) {
      setSaved(false);
      return;
    }
    let cancelled = false;
    itemsApi.isSaved(uid, item.item.id).then((v) => {
      if (!cancelled) setSaved(v);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, item.item]);

  const onLikeClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const uid = userId ?? readLoggedInUserId();
      if (!uid) {
        window.location.href = '/login';
        return;
      }
      if (liking) return;
      setLiking(true);
      try {
        if (liked) {
          await itemsApi.unlike(uid, item.item.id);
          setLiked(false);
          setLikeCount((c) => Math.max(0, c - 1));
        } else {
          await itemsApi.like({ userId: uid, itemId: item.item.id });
          setLiked(true);
          setLikeCount((c) => c + 1);
        }
      } catch {
        // keep UI unchanged on failure
      } finally {
        setLiking(false);
      }
    },
    [userId, liked, liking, item.item.id]
  );

  const onBookmarkClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const uid = userId ?? readLoggedInUserId();
      if (!uid) {
        window.location.href = '/login';
        return;
      }
      if (saving) return;
      setSaving(true);
      try {
        if (saved) {
          await itemsApi.unsave(uid, item.item.id);
          setSaved(false);
          setSaveCount((c) => Math.max(0, c - 1));
        } else {
          await itemsApi.save({ userId: uid, itemId: item.item.id });
          setSaved(true);
          setSaveCount((c) => c + 1);
        }
      } catch {
        // keep UI unchanged on failure
      } finally {
        setSaving(false);
      }
    },
    [userId, saved, saving, item.item.id]
  );

  const linkClassName =
    layout === 'grid'
      ? 'group block w-full min-w-0'
      : 'group block w-[min(85vw,200px)] shrink-0';

  return (
    <Link href={`/items/${item.item.slug}`} className={linkClassName}>
      <article
        className="
          flex h-full flex-col overflow-hidden rounded-xl bg-ff-black
          transition-all duration-300
          hover:opacity-95
          focus-visible:ring-2 focus-visible:ring-ff-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-black
          border-2 border-transparent 
       group-hover:border-2 group-hover:border-ff-cyan
        "
      >
        {/* Product Image */}
        <div className="relative aspect-square w-full ">
          <Image
            src={item.item.imageUrl || "/tnf-jacket.jpg"}
            alt={item.item.name}
            fill
            className="object-contain transition-transform duration-500 rounded-xl"
            sizes="(max-width: 640px) 85vw, 320px"
          />
          <div className='absolute inset-0 bg-black/10 group-hover:bg-transparent'></div>

          <div
            className="absolute bottom-[0px] left-[0px] flex px-1.5 py-1 transition-all duration-300 justify-between gap-3
             rounded-tr-xl bg-black/80 group-hover:opacity-0"
          >
            <div className="flex items-center gap-[4px]">
              <Star className="size-4 text-yellow-400 sm:size-3" strokeWidth={1.5} />
              <span className="text-xs text-white sm:text-xs">
                {item.item.rating != null ? Number(item.item.rating).toFixed(1) : '—'}
              </span>
            </div>
          </div>

          <div
            className="absolute bottom-[1px] right-[1px] flex  transition-all duration-300 justify-between gap-3
             group-hover:opacity-0 px-1.5 py-1 rounded-xl bg-black/30"
          >
            <div className="flex items-center gap-[3px]">
              <Eye className="size-3 text-white/50" strokeWidth={1.5} />
              <span className="text-xs text-white/50 sm:text-[10px]">
                {formatCount(item.item.viewCount)}
              </span>
            </div>
          </div>


          {/* <div
            className="absolute bottom-0 right-0 flex px-3 pt-1.5 rounded-tl-xl transition-all duration-300 justify-between gap-3 pt-1
            bg-black/80 group-hover:opacity-0 "
          >
            <div className="flex flex-col items-center gap-[1px]">
              <HeartIcon className="size-4 text-ff-cyan sm:size-4.5" strokeWidth={1.5} />
              <span className="text-xs text-white sm:text-xs">1.2k</span>
            </div>
            <div className="flex flex-col items-center gap-[1px]">
              <Eye className="size-4 text-ff-cyan sm:size-4.5" strokeWidth={1.5} />
              <span className="text-xs text-white sm:text-xs">20k</span>
            </div>
            <div className="flex flex-col items-center gap-[1px]">
              <MessageCircle className="size-4 text-ff-cyan sm:size-4.5" strokeWidth={1.5} />
              <span className="text-xs text-white sm:text-xs">326</span>
            </div>
          </div> */}
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
              aria-label={liked ? 'Unlike item' : 'Like item'}
              aria-pressed={liked}
            >
              <HeartIcon
                className={`size-3.5 sm:size-4 shrink-0 ${liked ? 'fill-ff-cyan text-ff-cyan' : 'text-ff-cyan'}`}
                strokeWidth={1.5}
              />
              <span className="text-xs text-white sm:text-xs tabular-nums">{formatCount(likeCount)}</span>
            </button>
            <div className="flex items-center gap-1">
              <MessageCircle
                className={`size-3.5 sm:size-4 shrink-0 ${
                  (isItemViewerRow(item.item) && item.item.isCommented) ||
                  (!isItemViewerRow(item.item) && item.viewerEngagement?.isCommented)
                    ? 'fill-ff-cyan text-ff-cyan'
                    : 'text-ff-cyan'
                }`}
                strokeWidth={1.5}
              />
              <span className="text-xs text-white sm:text-xs tabular-nums">
                {formatCount(item.item.commentCount)}
              </span>
            </div>
            <button
              type="button"
              onClick={onBookmarkClick}
              disabled={saving}
              className="flex items-center gap-[2px] rounded-md p-0.5 -m-0.5 transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
              aria-label={saved ? 'Remove from saved' : 'Save item'}
              aria-pressed={saved}
            >
              <BookmarkIcon
                className={`size-3.5 sm:size-4 shrink-0 ${saved ? 'fill-ff-cyan text-ff-cyan' : 'text-ff-cyan'}`}
                strokeWidth={1.5}
              />
              <span className="text-xs text-white sm:text-xs tabular-nums">{formatCount(saveCount)}</span>
            </button>
          </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between">
          <h3 className="line-clamp-2 text-start text-xs font-semibold leading-snug text-white px-2">
            {item.item.name}
          </h3>
          {/* <h3 className="line-clamp-2 text-center text-sm font-medium text-white sm:text-sm group-hover:flex hidden">
            {item.item.viewCount} views
          </h3> */}

          {/* <div className="mt-4 flex items-center justify-center gap-4 sm:gap-5 hidden group-hover:flex">
            <div className="flex flex-col items-center gap-1">
              <Star className="size-5 text-ff-cyan sm:size-6" strokeWidth={1.5} />
              <span className="text-xs text-white sm:text-sm">
                {item.item.rating != null
                  ? Number(item.item.rating).toFixed(1)
                  : formatCount(item.item.likeCount)}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Eye className="size-5 text-ff-cyan sm:size-6" strokeWidth={1.5} />
              <span className="text-xs text-white sm:text-sm">
                {formatCount(item.item.viewCount)}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <MessageCircle className="size-5 text-ff-cyan sm:size-6" strokeWidth={1.5} />
              <span className="text-xs text-white sm:text-sm">
                {formatCount(item.item.commentCount)}
              </span>
            </div>
          </div> */}
        </div>
      </article>
    </Link>
  );
}
// export default function ItemCard({ item }: ItemCardProps) {
//   return (
//     <Link
//       href={`/items/${item.item.slug}`}
//       className="group block w-[min(85vw,200px)] shrink-0 "
//     >
//       <article
//         className="
//           flex h-full flex-col overflow-hidden rounded-xl bg-ff-black
//           transition-all duration-300
//           hover:opacity-95
//           focus-visible:ring-2 focus-visible:ring-ff-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-black
//           border-2 border-transparent 
//        group-hover:border-2 group-hover:border-ff-cyan
//         "
//       >
//         {/* Product Image */}
//         <div className="relative aspect-square w-full ">
//           <Image
//             src={item.item.imageUrl || "/tnf-jacket.jpg"}
//             alt={item.item.name}
//             fill
//             className="object-contain transition-transform duration-500 rounded-xl"
//             sizes="(max-width: 640px) 85vw, 320px"
//           />
//           <div className='absolute inset-0 bg-black/20 group-hover:bg-transparent'></div>

//           <div
//             className="absolute top-[0px] left-[0px] flex px-1.5 py-1 transition-all duration-300 justify-between gap-3 py-1 
//              rounded-br-xl bg-black/80 group-hover:opacity-0"
//           >
//               <div className="flex items-center gap-[4px]">
//                 <Star className="size-4 text-yellow-200 sm:size-4.5" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-sm">8.9</span>
//             </div>
//           </div>


//           {/* <div
//             className="absolute bottom-0 right-0 flex px-3 pt-1.5 rounded-tl-xl transition-all duration-300 justify-between gap-3 pt-1
//             bg-black/80 group-hover:opacity-0 "
//           >
//             <div className="flex flex-col items-center gap-[1px]">
//               <HeartIcon className="size-4 text-ff-cyan sm:size-4.5" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-xs">1.2k</span>
//             </div>
//             <div className="flex flex-col items-center gap-[1px]">
//               <Eye className="size-4 text-ff-cyan sm:size-4.5" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-xs">20k</span>
//             </div>
//             <div className="flex flex-col items-center gap-[1px]">
//               <MessageCircle className="size-4 text-ff-cyan sm:size-4.5" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-xs">326</span>
//             </div>
//           </div> */}
//         </div>

//         <div
//             className="  flex rounded-bl-xl transition-all duration-300 justify-center gap-5
//             bg-black/80 group-hover:opacity-0 p-3"
//           >
//             <div className="flex flex-col items-center gap-[1px]">
//               <HeartIcon className="size-4 text-ff-cyan sm:size-4.5" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-xs">1.2k</span>
//             </div>
//             <div className="flex flex-col items-center gap-[1px]">
//               <Eye className="size-4 text-ff-cyan sm:size-4.5" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-xs">20k</span>
//             </div>
//             <div className="flex flex-col items-center gap-[1px]">
//               <MessageCircle className="size-4 text-ff-cyan sm:size-4.5" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-xs">326</span>
//             </div>
//           </div>

//         {/* Content */}
//         <div className="flex flex-1 flex-col justify-between">
//           <h3 className="line-clamp-2 text-center text-sm font-medium text-white sm:text-sm ">
//             {item.item.name}
//           </h3>
//           {/* <h3 className="line-clamp-2 text-center text-sm font-medium text-white sm:text-sm group-hover:flex hidden">
//             {item.item.viewCount} views
//           </h3> */}

//           {/* <div className="mt-4 flex items-center justify-center gap-4 sm:gap-5 hidden group-hover:flex">
//             <div className="flex flex-col items-center gap-1">
//               <Star className="size-5 text-ff-cyan sm:size-6" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-sm">
//                 {item.item.rating != null
//                   ? Number(item.item.rating).toFixed(1)
//                   : formatCount(item.item.likeCount)}
//               </span>
//             </div>

//             <div className="flex flex-col items-center gap-1">
//               <Eye className="size-5 text-ff-cyan sm:size-6" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-sm">
//                 {formatCount(item.item.viewCount)}
//               </span>
//             </div>

//             <div className="flex flex-col items-center gap-1">
//               <MessageCircle className="size-5 text-ff-cyan sm:size-6" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-sm">
//                 {formatCount(item.item.commentCount)}
//               </span>
//             </div>
//           </div> */}
//         </div>
//       </article>
//     </Link>
//   );
// }


// export default function ItemCard({ item }: ItemCardProps) {
//   return (
//     <Link
//       href={`/items/${item.item.slug}`}
//       className="group block w-[min(85vw,180px)] shrink-0 "
//     >
//       <article
//         className="
//           flex h-full flex-col overflow-hidden rounded-xl bg-ff-black
//           transition-all duration-300
//           hover:opacity-95
//           focus-visible:ring-2 focus-visible:ring-ff-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-black
//           border-2 border-transparent 
//        group-hover:border-2 group-hover:border-ff-cyan
//         "
//       >
//         {/* Product Image */}
//         <div className="relative aspect-square w-full overflow-hidden">
//           <Image
//             src={item.item.imageUrl || "/tnf-jacket.jpg"}
//             alt={item.item.name}
//             fill
//             className="object-contain transition-transform duration-500  rounded-xl"
//             sizes="(max-width: 640px) 85vw, 320px"
//           />

//           <div
//             className="absolute top-[0px] left-[0px] flex px-1.5 py-1 transition-all duration-300 justify-between gap-3 py-1 
//             bg-black/80 rounded-br-xl"
//           >
//               <div className="flex flex-col items-center gap-[1px]">
//                 <Star className="size-3 text-yellow-200 sm:size-4.5" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-xs">8.9</span>
//             </div>
//           </div>

//           <div
//             className="absolute bottom-[1px] right-[1px] flex px-3 py-1 rounded-xl transition-all duration-300 justify-between gap-3 pt-1
//             bg-black/80"
//           >
//             <div className="flex flex-col items-center gap-[1px]">
//               <HeartIcon className="size-3 text-ff-cyan sm:size-4.5" strokeWidth={1} />
//               <span className="text-xs text-white sm:text-xs">1.2k</span>
//             </div>
//             <div className="flex flex-col items-center gap-[1px]">
//               <Eye className="size-3 text-ff-cyan sm:size-4.5" strokeWidth={1} />
//               <span className="text-xs text-white sm:text-xs">20k</span>
//             </div>
//             <div className="flex flex-col items-center gap-[1px]">
//               <MessageCircle className="size-3 text-ff-cyan sm:size-4.5" strokeWidth={1} />
//               <span className="text-xs text-white sm:text-xs">326</span>
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
//           <h3 className="line-clamp-2 text-center text-sm font-medium text-white sm:text-sm ">
//             {item.item.name}
//           </h3>
//           {/* <h3 className="line-clamp-2 text-center text-sm font-medium text-white sm:text-sm group-hover:flex hidden">
//             {item.item.viewCount} views
//           </h3> */}

//           {/* <div className="mt-4 flex items-center justify-center gap-4 sm:gap-5 hidden group-hover:flex">
//             <div className="flex flex-col items-center gap-1">
//               <Star className="size-5 text-ff-cyan sm:size-6" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-sm">
//                 {item.item.rating != null
//                   ? Number(item.item.rating).toFixed(1)
//                   : formatCount(item.item.likeCount)}
//               </span>
//             </div>

//             <div className="flex flex-col items-center gap-1">
//               <Eye className="size-5 text-ff-cyan sm:size-6" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-sm">
//                 {formatCount(item.item.viewCount)}
//               </span>
//             </div>

//             <div className="flex flex-col items-center gap-1">
//               <MessageCircle className="size-5 text-ff-cyan sm:size-6" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-sm">
//                 {formatCount(item.item.commentCount)}
//               </span>
//             </div>
//           </div> */}
//         </div>
//       </article>
//     </Link>
//   );
// }

// export default function ItemCard({ item }: ItemCardProps) {
//   return (
//     <Link
//       href={`/items/${item.item.slug}`}
//       className="group block w-[min(85vw,180px)] shrink-0 "
//     >
//       <article
//         className="
//           flex h-full flex-col overflow-hidden rounded-xl bg-ff-black
//           transition-all duration-300
//           hover:opacity-95
//           focus-visible:ring-2 focus-visible:ring-ff-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-black
//           border-2 border-transparent 
//        group-hover:border-2 group-hover:border-ff-cyan
//         "
//       >
//         {/* Product Image */}
//         <div className="relative aspect-square w-full overflow-hidden">
//           <Image
//             src={item.item.imageUrl || "/tnf-jacket.jpg"}
//             alt={item.item.name}
//             fill
//             className="object-contain transition-transform duration-500  rounded-xl"
//             sizes="(max-width: 640px) 85vw, 320px"
//           />

//           <div
//             className="absolute -top-[0px] left-0 flex pr-2 pl-1 transition-all duration-300 justify-between gap-3 py-1 rounded-br-lg
//             bg-black/80"
//           >
//               <div className="flex items-center gap-[3px]">
//                 <Star className="size-3 text-yellow-200 sm:size-4.5" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-sm">8.9</span>
//             </div>
//           </div>

//           <div className="absolute bottom-0 -right-1 max-w-full transition-all duration-300">
//             <div className="relative w-full max-w-[124px]">
//               <svg
//                 className="block h-auto w-full"
//                 viewBox="0 0 169 50"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden
//               >
//                 <path
//                   d="M18.5542 11.3454C21.8827 4.41108 28.8929 0 36.5847 0H169V30C169 41.0457 160.046 50 149 50H0L18.5542 11.3454Z"
//                   className="fill-black/80"
//                 />
//               </svg>
//               <div className="absolute inset-0 flex items-center justify-end gap-1 px-2 pr-2 sm:gap-4 pt-1">
//                 <div className="flex flex-col items-center gap-[1px]">
//                   <HeartIcon className="size-3 text-ff-cyan sm:size-4.5" strokeWidth={1} />
//                   <span className="text-xs text-white sm:text-xs">
//                     {formatCount(item.item.likeCount)}1.2
//                   </span>
//                 </div>
//                 <div className="flex flex-col items-center gap-[1px]">
//                   <Eye className="size-3 text-ff-cyan sm:size-4.5" strokeWidth={1} />
//                   <span className="text-xs text-white sm:text-xs">
//                     {formatCount(item.item.viewCount)}20k
//                   </span>
//                 </div>
//                 <div className="flex flex-col items-center gap-[1px]">
//                   <MessageCircle className="size-3 text-ff-cyan sm:size-4.5" strokeWidth={1} />
//                   <span className="text-xs text-white sm:text-xs">
//                     {formatCount(item.item.commentCount)}326
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
//           <h3 className="line-clamp-2 text-center text-sm font-medium text-white sm:text-sm ">
//             {item.item.name}
//           </h3>
//           {/* <h3 className="line-clamp-2 text-center text-sm font-medium text-white sm:text-sm group-hover:flex hidden">
//             {item.item.viewCount} views
//           </h3> */}

//           {/* <div className="mt-4 flex items-center justify-center gap-4 sm:gap-5 hidden group-hover:flex">
//             <div className="flex flex-col items-center gap-1">
//               <Star className="size-5 text-ff-cyan sm:size-6" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-sm">
//                 {item.item.rating != null
//                   ? Number(item.item.rating).toFixed(1)
//                   : formatCount(item.item.likeCount)}
//               </span>
//             </div>

//             <div className="flex flex-col items-center gap-1">
//               <Eye className="size-5 text-ff-cyan sm:size-6" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-sm">
//                 {formatCount(item.item.viewCount)}
//               </span>
//             </div>

//             <div className="flex flex-col items-center gap-1">
//               <MessageCircle className="size-5 text-ff-cyan sm:size-6" strokeWidth={1.5} />
//               <span className="text-xs text-white sm:text-sm">
//                 {formatCount(item.item.commentCount)}
//               </span>
//             </div>
//           </div> */}
//         </div>
//       </article>
//     </Link>
//   );
// }


// export default function ItemCard({ item }: ItemCardProps) {
//   return (
//     <Link href={`/items/${item.item.slug}`} className="block">
//       <div className="w-[260px] min-h-[260px] h-full bg-ff-black rounded-lg overflow-hidden flex flex-col hover:opacity-90 transition-opacity">
//         {/* Product Image */}
//         <div className="relative min-h-[200px] w-full flex-shrink-0 overflow-hidden">
//           <Image
//             src={item.item.imageUrl ? item.item.imageUrl : '/tnf-jacket.jpg'}
//             alt={item.item.name}
//             fill
//             // className="h-full w-full scale-150 object-contain hover:scale-120 transition-all duration-700"
//             className="object-contain"
//             sizes="208px"
            
//           />
//         </div>

//         {/* Content Section */}
//         <div className="flex-1 flex flex-col justify-between py-3">
//           {/* Title */}
//           <h3 className="text-white text-[16px] font-medium line-clamp-2 mb-3 text-center truncate">
//             {item.item.name}
//           </h3>

//           {/* Engagement Metrics */}
//           <div className="flex items-center justify-center gap-4">
//             {/* Rating (or like count fallback) */}
//             <div className="flex flex-col items-center gap-1">
//               <Star className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
//               <span className="text-white text-[14px]">
//                 {item.item.rating != null ? Number(item.item.rating).toFixed(1) : formatCount(item.item.likeCount)}
//               </span>
//             </div>

//             {/* View Count */}
//             <div className="flex flex-col items-center gap-1">
//               <Eye className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
//               <span className="text-white text-[14px]">
//                 {formatCount(item.item.viewCount)}
//               </span>
//             </div>

//             {/* Comment Count */}
//             <div className="flex flex-col items-center gap-1">
//               <MessageCircle className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
//               <span className="text-white text-[14px]">
//                 {formatCount(item.item.commentCount)}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }

