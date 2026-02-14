'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { tierlistsApi } from '@/features/tierlists/api/tierlists.api';
import { itemsApi } from '@/features/items/api/items.api';
import { usersApi } from '@/features/users/api/users.api';
import type { TierListDetailResponse } from '@/features/tierlists/types/tierlists.types';
import type { ItemResponse } from '@/features/items/types/items.types';
import type { UserProfileResponse } from '@/features/users/types/users.types';

interface TierItemWithDetails {
  id: string;
  tierListId: string;
  tierId: string;
  itemId: string;
  position: number;
  createdAt: string;
  item?: ItemResponse;
}

interface TierWithItemDetails {
  id: string;
  tierListId: string;
  label: string | null;
  name: string;
  color: string | null;
  position: number;
  items: TierItemWithDetails[];
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Published today';
  if (diffInDays === 1) return 'Published yesterday';
  if (diffInDays < 7) return `Published ${diffInDays} days ago`;
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Published ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `Published ${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(diffInDays / 365);
  return `Published ${years} ${years === 1 ? 'year' : 'years'} ago`;
}

export default function TierListPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const slug = params.slug as string;

  const [tierList, setTierList] = useState<TierListDetailResponse | null>(null);
  const [tiersWithItemDetails, setTiersWithItemDetails] = useState<TierWithItemDetails[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTierList() {
      try {
        setLoading(true);
        setError(null);

        // Fetch tier list detail by slug
        const tierListData = await tierlistsApi.getDetailBySlug(slug);
        setTierList(tierListData);

        // Fetch user profile for metadata
        const profileData = await usersApi.getProfile(tierListData.userId);
        setUserProfile(profileData);

        // Fetch item details for each tier item
        const tiersWithDetails = await Promise.all(
          tierListData.tiers.map(async (tier) => {
            const itemsWithDetails = await Promise.all(
              tier.items.map(async (tierItem) => {
                try {
                  const itemDetails = await itemsApi.getById(tierItem.itemId);
                  return {
                    ...tierItem,
                    item: itemDetails,
                  };
                } catch (err) {
                  console.error(`Failed to fetch item ${tierItem.itemId}:`, err);
                  return {
                    ...tierItem,
                    item: undefined,
                  };
                }
              })
            );
            return {
              ...tier,
              items: itemsWithDetails,
            };
          })
        );

        setTiersWithItemDetails(tiersWithDetails);
      } catch (err) {
        console.error('Error fetching tier list:', err);
        setError('Failed to load tier list');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchTierList();
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-ff-black text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-8">
          <div className="text-slate-400">Loading tier list...</div>
        </div>
      </main>
    );
  }

  if (error || !tierList) {
    return (
      <main className="min-h-screen bg-ff-black text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-8">
          <div className="text-red-400">{error || 'Tier list not found'}</div>
          <Link
            href={`/${username}`}
            className="mt-4 text-ff-cyan hover:underline"
          >
            Back to profile
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ff-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Banner Section */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-800">
          <div className="relative h-64 w-full md:h-80">
            <Image
              src={tierList.coverImageUrl || '/tier-list-bg.jpg'}
              alt={tierList.title}
              fill
              className="object-cover opacity-90"
              sizes="100vw"
              priority
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Metadata Overlay */}
            {userProfile && (
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-slate-700">
                  <Image
                    src={userProfile.avatarUrl || '/face.jpg'}
                    alt={userProfile.username}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="text-white">
                  <p className="text-sm font-medium">
                    Tier-list by{' '}
                    <Link href={`/${userProfile.username}`} className="font-bold text-ff-cyan hover:underline">
                      {userProfile.username}
                    </Link>
                  </p>
                  <p className="text-xs text-white/70">{formatTimeAgo(tierList.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title, Description, and Actions */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="mb-2 text-4xl font-bold uppercase">{tierList.title}</h1>
            {tierList.description && (
              <p className="text-lg text-slate-300">{tierList.description}</p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link
              href={`/${username}/tierlists/${slug}/edit`}
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Tier List Grid */}
        <div className="space-y-2">
          {tiersWithItemDetails.map((tier) => {
            const tierLabel = tier.label || tier.name.charAt(0).toUpperCase();
            const tierColor = tier.color || '#6B7280'; // Default gray
            
            return (
              <div
                key={tier.id}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3 min-h-[100px]"
              >
                {/* Tier Label */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: tierColor }}
                >
                  {tierLabel}
                </div>

                {/* Items */}
                <div className="flex flex-1 gap-2 flex-wrap">
                  {tier.items.length > 0 ? (
                    tier.items.map((tierItem) => (
                      <div
                        key={tierItem.id}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-white/10 bg-slate-800"
                      >
                        {tierItem.item?.imageUrl ? (
                          <Link href={`/items/${tierItem.item.slug}`}>
                            <Image
                              src={tierItem.item.imageUrl}
                              alt={tierItem.item.name || ''}
                              fill
                              className="object-cover hover:opacity-80 transition-opacity"
                              sizes="80px"
                            />
                          </Link>
                        ) : (
                          <div className="h-full w-full bg-slate-700" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center text-slate-500 text-sm">
                      The tier is empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        
      </div>
    </main>
  );
}
