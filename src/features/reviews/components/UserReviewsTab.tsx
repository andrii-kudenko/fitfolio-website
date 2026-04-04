'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ThumbsUp, MoreHorizontal, Star } from 'lucide-react';
import { reviewsApi } from '@/features/reviews/api/reviews.api';
import { itemsApi } from '@/features/items/api/items.api';
import { usersApi } from '@/features/users/api/users.api';
import type { ReviewResponse } from '@/features/reviews/types/reviews.types';
import type { FitProfileResponse } from '@/features/users/types/users.types';
import { fitInfoFromProfile } from '@/features/reviews/utils/reviewDisplay';

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-700/60 ${className}`} />;
}

export interface UserReviewsTabProps {
  userId: string;
  username: string;
  avatarUrl: string | null;
}

type ItemSummary = { slug: string; name: string; imageUrl?: string };

function sortParam(sortBy: string): string {
  switch (sortBy) {
    case 'oldest':
      return 'createdAt,asc';
    case 'rating-high':
      return 'rating,desc';
    case 'rating-low':
      return 'rating,asc';
    default:
      return 'createdAt,desc';
  }
}

export function UserReviewsTab({ userId, username, avatarUrl }: UserReviewsTabProps) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [itemsById, setItemsById] = useState<Record<string, ItemSummary>>({});
  const [fitProfile, setFitProfile] = useState<FitProfileResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const page = await reviewsApi.getForUser(userId, {
          sort: sortParam(sortBy),
          size: 50,
        });
        if (cancelled) return;
        const list = page.content || [];
        setReviews(list);

        const itemIds = [...new Set(list.map((r) => r.itemId))];
        const itemResults = await Promise.all(
          itemIds.map((id) => itemsApi.getById(id).catch(() => null))
        );
        if (cancelled) return;
        const map: Record<string, ItemSummary> = {};
        itemResults.forEach((item, i) => {
          const id = itemIds[i];
          if (item) {
            map[id] = {
              slug: item.slug,
              name: item.name,
              imageUrl: item.imageUrl,
            };
          }
        });
        setItemsById(map);

        const fp = await usersApi.getFitProfile(userId).catch(() => null);
        if (!cancelled) setFitProfile(fp);
      } catch {
        if (!cancelled) {
          setReviews([]);
          setItemsById({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, sortBy]);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-white/60 text-sm font-medium">SORT BY</span>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:border-ff-cyan focus:outline-none cursor-pointer"
          >
            <option value="newest">NEWEST</option>
            <option value="oldest">OLDEST</option>
            <option value="rating-high">HIGHEST RATING</option>
            <option value="rating-low">LOWEST RATING</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-white/60">No reviews yet.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const item = itemsById[review.itemId];
            const fitInfo: string[] = fitInfoFromProfile(fitProfile, review.purchasedSize);

            return (
              <div key={review.id} className="border border-white/10 rounded-lg p-6">
                <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                  {item ? (
                    <Link
                      href={`/items/${item.slug}`}
                      className="flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-90"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-white/5" />
                        )}
                      </div>
                      <span className="min-w-0 truncate text-sm font-medium text-white/80">
                        {item.name}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex flex-1 items-center gap-3 opacity-50">
                      <div className="h-14 w-14 shrink-0 rounded-lg border border-white/10 bg-white/5" />
                      <span className="text-sm text-white/60">Item unavailable</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-[8rem_1fr] sm:gap-8">
                  <div className="flex flex-row gap-2 sm:flex-col max-sm:items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={username}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-white/60">
                          {username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 sm:flex-none">
                      <p className="break-words text-sm font-medium text-white/80">@{username}</p>
                      {fitInfo.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/60">
                          {fitInfo.map((info, idx) => (
                            <span key={idx}>{info}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-3 flex items-center gap-4">
                      <div className="flex shrink-0 items-center gap-1 text-xl font-semibold text-yellow-300">
                        {review.rating != null ? (
                          <>
                            <span>{review.rating}</span>
                            <Star className="size-6 shrink-0 fill-yellow-300 text-yellow-300" aria-hidden />
                          </>
                        ) : (
                          <span className="text-base font-normal text-white/50">N/A</span>
                        )}
                      </div>
                      {review.title && (
                        <h3 className="min-w-0 flex-1 text-xl font-semibold">{review.title}</h3>
                      )}
                    </div>

                    {review.text && (
                      <p className="mb-4 leading-relaxed text-white/80">{review.text}</p>
                    )}

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        className="flex items-center gap-2 text-white/60 transition hover:text-white"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-sm">{review.likeCount ?? 0}</span>
                      </button>
                      <button
                        type="button"
                        className="text-white/60 transition hover:text-white"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
