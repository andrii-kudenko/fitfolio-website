'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Eye, MessageCircle, ArrowLeft, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { collectionsApi } from '@/features/collections/api/collections.api';
import { itemsApi } from '@/features/items/api/items.api';
import { usersApi } from '@/features/users/api/users.api';
import type {
  CollectionDetailResponse,
  CollectionItemResponse,
} from '@/features/collections/types/collections.types';
import type { ItemResponse } from '@/features/items/types/items.types';
import type { UserProfileResponse } from '@/features/users/types/users.types';
import CommentsSection from '@/features/comments/CommentsSection';

interface CollectionItemWithDetails extends CollectionItemResponse {
  item?: ItemResponse;
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

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const slug = params.slug as string;

  const [collection, setCollection] = useState<CollectionDetailResponse | null>(null);
  const [items, setItems] = useState<CollectionItemWithDetails[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCollection() {
      try {
        setLoading(true);
        setError(null);

        const collectionData = await collectionsApi.getDetailBySlug(slug);
        setCollection(collectionData);

        const profileData = await usersApi.getProfile(collectionData.userId);
        setUserProfile(profileData);

        const itemsWithDetails = await Promise.all(
          collectionData.items.map(async (collectionItem) => {
            try {
              const itemDetails = await itemsApi.getById(collectionItem.itemId);
              return {
                ...collectionItem,
                item: itemDetails,
              };
            } catch (err) {
              console.error(`Failed to fetch item ${collectionItem.itemId}:`, err);
              return {
                ...collectionItem,
                item: undefined,
              };
            }
          })
        );

        setItems(itemsWithDetails);
      } catch (err) {
        console.error('Error fetching collection:', err);
        setError('Failed to load collection');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchCollection();
    }
  }, [slug]);

  function formatCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-ff-black text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-8">
          <div className="text-slate-400">Loading collection...</div>
        </div>
      </main>
    );
  }

  if (error || !collection) {
    return (
      <main className="min-h-screen bg-ff-black text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-8">
          <div className="text-red-400">{error || 'Collection not found'}</div>
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
        {/* Back Button */}
        <Link
          href={`/${username}`}
          className="mb-6 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to profile
        </Link>

        {/* Banner Section */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-slate-800">
          <div className="relative h-64 w-full md:h-80">
            <Image
              src={collection.coverImageUrl || '/collection-bg.jpg'}
              alt={collection.title}
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
                  <p className="text-sm font-medium">Collection by {userProfile.username}</p>
                  <p className="text-xs text-white/70">{formatTimeAgo(collection.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter and Sort Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">FILTER BY</span>
            <button className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-white hover:bg-slate-800">
              CATEGORY
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-white hover:bg-slate-800">
              BRAND
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-white hover:bg-slate-800">
              RATING
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-white hover:bg-slate-800">
              PRICE
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-slate-400">SORT BY</span>
            <button className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-white hover:bg-slate-800">
              {collection.isRanked ? 'RANK' : 'DATE'}
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-white hover:bg-slate-800">
              REVERSE
            </button>
          </div>
        </div>

        {/* Collection Details Section */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{collection.title}</h1>
            {collection.description && (
              <p className="text-slate-300 text-lg">{collection.description}</p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link
              href={`/${username}/collections/${slug}/edit`}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
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

        {/* Items Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((collectionItem, index) => (
              <div key={collectionItem.id} className="group relative">
                {collectionItem.item ? (
                  <Link href={`/items/${collectionItem.item.slug}`} className="block">
                    <div className="relative w-full bg-white rounded-lg overflow-hidden">
                      {/* Product Image */}
                      <div className="relative w-full aspect-square overflow-hidden">
                        <Image
                          src={collectionItem.item.imageUrl || '/tnf-jacket.jpg'}
                          alt={collectionItem.item.name}
                          fill
                          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>

                      {/* Rank Number - Below Image (Only show if collection is ranked) */}
                      {collection.isRanked && (
                        <div className="flex items-center justify-center bg-white py-3">
                          <span className="text-3xl font-bold text-black">{collectionItem.rank}</span>
                        </div>
                      )}

                      {/* Hover Tooltip */}
                      <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 z-10">
                        <h3 className="text-white text-xl font-semibold mb-4 text-center">
                          {collectionItem.item.name}
                        </h3>
                        <div className="flex items-center gap-8">
                          <div className="flex flex-col items-center gap-1">
                            <Star className="w-6 h-6 text-ff-cyan" strokeWidth={1.5} />
                            <span className="text-white text-base font-medium">
                              {collectionItem.item.rating ? collectionItem.item.rating.toFixed(1) : '0'}
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <Eye className="w-6 h-6 text-ff-cyan" strokeWidth={1.5} />
                            <span className="text-white text-base font-medium">
                              {formatCount(collectionItem.item.viewCount)}
                            </span>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <MessageCircle className="w-6 h-6 text-ff-cyan" strokeWidth={1.5} />
                            <span className="text-white text-base font-medium">
                              {formatCount(collectionItem.item.commentCount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="w-full bg-slate-900 rounded-lg p-8 text-center aspect-square flex items-center justify-center">
                    <p className="text-slate-400 text-sm">Item not found</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl font-bold text-white">This collection is empty.</p>
          </div>
        )}

        <section className="mt-12 border-t border-slate-800 pt-10">
          <h2 className="mb-6 text-xl font-semibold text-white">Comments</h2>
          <CommentsSection subjectType="COLLECTION" subjectId={collection.id} />
        </section>
      </div>
    </main>
  );
}
