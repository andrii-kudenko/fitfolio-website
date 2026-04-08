'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ThumbsUp, MoreHorizontal, Star } from 'lucide-react';
import type { ReviewResponse } from '@/features/reviews/types/reviews.types';
import type { UserProfileResponse, FitProfileResponse } from '@/features/users/types/users.types';
import { fitInfoFromProfile } from '@/features/reviews/utils/reviewDisplay';

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-700/60 ${className}`} />;
}

export interface ItemReviewsTabProps {
  slug: string;
  reviews: ReviewResponse[];
  reviewsLoading: boolean;
  sortBy: string;
  onSortChange: (sort: string) => void;
  userProfiles: Record<string, UserProfileResponse>;
  fitProfiles: Record<string, FitProfileResponse>;
}

export function ItemReviewsTab({
  slug,
  reviews,
  reviewsLoading,
  sortBy,
  onSortChange,
  userProfiles,
  fitProfiles,
}: ItemReviewsTabProps) {
  return (
    <>
      <Link
        href={`/items/${slug}/review`}
        className="block w-full px-4 py-3 mb-6 bg-white/5 border border-white/20 rounded-lg text-white/60 hover:border-white/40 hover:text-white transition text-left"
      >
        + Write a review
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-white/60 text-sm font-medium">SORT BY</span>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
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

      {reviewsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-white/60">
          No reviews yet. Be the first to review this item!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const userProfile = userProfiles[review.userId];
            const fitProfile = fitProfiles[review.userId];
            const username = userProfile?.username || 'anonymous';
            const fitInfo = fitInfoFromProfile(fitProfile, review.purchasedSize);

            return (
              <div
                key={review.id}
                className="border border-white/10 rounded-lg p-6"
              >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_5fr] sm:gap-8">
                  <div className="flex flex-row items-center  gap-2 sm:flex-col max-sm:items-center">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      {userProfile?.avatarUrl ? (
                        <Image
                          src={userProfile.avatarUrl}
                          alt={username}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white/60 text-sm font-medium">
                          {username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 sm:flex-none ">
                      <p className="text-white/80 sm:text-center text-sm font-medium break-words">
                        @{username}
                      </p>
                      {fitInfo.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                          {fitInfo.map((info, idx) => (
                            <span key={idx}>{info}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="text-2xl font-semibold shrink-0 flex items-center gap-1 text-yellow-300">
                        {review.rating != null ? (
                          <>
                            <span>{review.rating}</span>
                            <Star className="size-5.5 shrink-0 fill-yellow-300 text-yellow-300" aria-hidden />
                          </>
                        ) : (
                          <span className="text-white/50 text-base font-normal">N/A</span>
                        )}
                      </div>
                      {review.title && (
                        <h3 className="text-xl font-semibold flex-1 min-w-0">{review.title}</h3>
                      )}
                    </div>

                    {review.text && (
                      <p className="text-white/80 mb-4 leading-relaxed">{review.text}</p>
                    )}

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        className="flex items-center gap-2 text-white/60 hover:text-white transition"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{review.likeCount || 0}</span>
                      </button>
                      <button
                        type="button"
                        className="text-white/60 hover:text-white transition"
                      >
                        <MoreHorizontal className="w-4 h-4" />
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
