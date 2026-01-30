'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Eye, MessageCircle, Search, ChevronRight } from 'lucide-react';
import { itemsApi } from '@/features/items/api/items.api';
import { ItemFullResponse } from '@/features/items/types/items.types';
import { useParams } from 'next/navigation';

// Mock related items
const mockRelatedItems = [
  {
    title: "The North Face Jacket",
    image: "/tnf-jacket.jpg",
    rating: 7.8,
    views: 5600,
    comments: 23
  },
  {
    title: "The North Face Jacket",
    image: "/tnf-jacket.jpg",
    rating: 7.8,
    views: 5600,
    comments: 23
  },
  {
    title: "The North Face Jacket",
    image: "/tnf-jacket.jpg",
    rating: 7.8,
    views: 5600,
    comments: 23
  },
  {
    title: "The North Face Jacket",
    image: "/tnf-jacket.jpg",
    rating: 7.8,
    views: 5600,
    comments: 23
  },
  {
    title: "The North Face Jacket",
    image: "/tnf-jacket.jpg",
    rating: 7.8,
    views: 5600,
    comments: 23
  }
];

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-700/60 ${className}`} />;
}

export default function ItemPage() {
  const [imageZoom, setImageZoom] = useState(false);
  const [item, setItem] = useState<ItemFullResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reveal, setReveal] = useState(false);
  const [showSkeletonOverlay, setShowSkeletonOverlay] = useState(true);
  const relatedItems = mockRelatedItems;
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    setLoading(true);
    setError(null);
    setItem(null);
    setReveal(false);
    setShowSkeletonOverlay(true);

    itemsApi
      .getBySlugFull(slug)
      .then(setItem)
      .catch((err) => {
        console.error('Error fetching item:', err);
        setError('Failed to load item');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!loading && item && !error) {
      // Double rAF ensures the "hidden" classes paint before we flip to "visible"
      // so the browser animates instead of jumping.
      let raf1 = 0;
      let raf2 = 0;
      raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => setReveal(true));
      });

      const t = window.setTimeout(() => setShowSkeletonOverlay(false), 750);

      return () => {
        window.cancelAnimationFrame(raf1);
        window.cancelAnimationFrame(raf2);
        window.clearTimeout(t);
      };
    }

    if (!loading && error) {
      setShowSkeletonOverlay(false);
    }
  }, [loading, item, error]);

  const isLoaded = !!item && !loading && !error;
  const ease = 'ease-[cubic-bezier(.2,.8,.2,1)]';
  const contentEnter = `transition-all duration-700 ${ease} will-change-[opacity,transform,filter] ${reveal ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-2 blur-sm'}`;
  const overlayLeave = `transition-opacity duration-700 ${ease} ${reveal ? 'opacity-0' : 'opacity-100'}`;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/items" className="hover:text-white">Sneakers</Link>
            <ChevronRight className="w-4 h-4" />
            {loading ? (
              <Skeleton className="h-4 w-28" />
            ) : (
              <span className="text-white underline">
                {item?.brand?.name || item?.item.name || 'Item'}
              </span>
            )}
          </div>
        </nav>

        {error && !loading ? (
          <div className="py-16 text-center">
            <div className="text-red-400 text-sm">{error}</div>
            <div className="mt-3">
              <Link href="/items" className="text-ff-cyan hover:underline">Back to Items</Link>
            </div>
          </div>
        ) : (
          <>
            {/* Product Details Section */}
            <section className="relative mb-12">
              {/* Cross-fade overlay to hide the skeleton->content swap */}
              {showSkeletonOverlay && (
                <div className={`pointer-events-none absolute inset-0 z-10 ${overlayLeave}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="relative">
                      <div className="relative aspect-square bg-ff-black rounded-lg overflow-hidden">
                        <div className="w-full h-full bg-slate-800 animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-4 w-32" />

                      <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                      </div>

                      <Skeleton className="h-8 w-36" />

                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-8 w-28 rounded-full" />
                        ))}
                      </div>

                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-24 mt-4" />
                      </div>

                      <div className="space-y-3 pt-4 border-t border-white/10">
                        <Skeleton className="h-6 w-28" />
                        <div className="p-3 bg-white/5 rounded-lg space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Skeleton className="flex-1 h-12 rounded-lg" />
                        <Skeleton className="flex-1 h-12 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${isLoaded ? contentEnter : ''}`}>
                {/* Product Image */}
                <div className="relative">
                  <div className="relative aspect-square bg-ff-black rounded-lg overflow-hidden">
                    {loading ? (
                      <div className="w-full h-full bg-slate-800 animate-pulse" />
                    ) : item?.item.imageUrl ? (
                      <>
                        <Image
                          src={item.item.imageUrl}
                          alt={item.item.name || ''}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <button
                          onClick={() => setImageZoom(!imageZoom)}
                          className="absolute top-4 left-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                          aria-label="Zoom image"
                        >
                          <Search className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <span className="text-white/40">No image</span>
                      </div>
                    )}
                  </div>

                  {imageZoom && item?.item.imageUrl && (
                    <div
                      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
                      onClick={() => setImageZoom(false)}
                    >
                      <div className="relative w-full h-full max-w-4xl">
                        <Image
                          src={item.item.imageUrl}
                          alt={item.item.name || ''}
                          fill
                          className="object-contain"
                          sizes="100vw"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Information */}
                <div className="space-y-6">
                  {/* Status Label */}
                  <div>
                    {loading ? (
                      <Skeleton className="h-6 w-24 rounded-full" />
                    ) : (
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                        Unverified
                      </span>
                    )}
                  </div>

                  {/* Brand */}
                  {loading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    item?.brand?.name && (
                      <div className="text-sm text-white/60">{item.brand.name}</div>
                    )
                  )}

                  {/* Title + Subtitle */}
                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-3/4" />
                      <Skeleton className="h-5 w-1/2" />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl md:text-4xl font-semibold">{item?.item.name || ''}</h1>
                      {item?.item.subTitle && (
                        <p className="text-lg text-white/70">{item.item.subTitle}</p>
                      )}
                    </>
                  )}

                  {/* Rating */}
                  {loading ? (
                    <Skeleton className="h-8 w-36" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-semibold">
                        ★{item?.item.rating ?? 0}
                      </span>
                      <span className="text-white/60">({item?.item.commentCount ?? 0})</span>
                    </div>
                  )}

                  {/* Tags */}
                  {loading ? (
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-28 rounded-full" />
                      ))}
                    </div>
                  ) : (
                    item?.item.details && item.item.details.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.item.details.map((detail, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-1 text-sm rounded-full border border-white/20 bg-white/5"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    )
                  )}

                  {/* Description */}
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-24 mt-4" />
                    </div>
                  ) : (
                    item?.item.description && (
                      <div>
                        <p className="text-white/80 leading-relaxed">{item.item.description}</p>
                        <Link href="#details" className="text-ff-cyan hover:underline mt-2 inline-block">
                          View Details
                        </Link>
                      </div>
                    )
                  )}

                  {/* Retailers */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <h3 className="text-lg font-medium">Where to Buy</h3>
                    {loading ? (
                      <div className="p-3 bg-white/5 rounded-lg space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ) : (
                      item?.item.sourceUrl && (
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <div className="font-medium">{item.item.sourceUrl}</div>
                            <div className="text-sm text-white/60">
                              {typeof item.item.price === 'number' ? `$${item.item.price.toFixed(2)}` : 'Price not available'}
                            </div>
                          </div>
                          {typeof item.item.price === 'number' ? (
                            <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                              In stock
                            </span>
                          ) : (
                            <span className="text-xs text-white/40">Check availability</span>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    {loading ? (
                      <>
                        <Skeleton className="flex-1 h-12 rounded-lg" />
                        <Skeleton className="flex-1 h-12 rounded-lg" />
                      </>
                    ) : (
                      <>
                        <button className="flex-1 px-6 py-3 bg-ff-cyan text-black font-medium rounded-lg hover:bg-ff-cyan/90 transition">
                          Read reviews
                        </button>
                        <button className="flex-1 px-6 py-3 border-2 border-white/20 text-white font-medium rounded-lg hover:border-white/40 transition">
                          Read Comments
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Details Section */}
            {loading ? (
              <section id="details" className="mb-12">
                <Skeleton className="h-8 w-32 mb-4" />
                <div className="bg-white/5 rounded-lg p-6 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </section>
            ) : (
              item?.item.details && item.item.details.length > 0 && (
                <section
                  id="details"
                  className={`mb-12 ${isLoaded ? contentEnter : ''}`}
                >
                  <h2 className="text-2xl font-semibold mb-4">Details</h2>
                  <div className="bg-white/5 rounded-lg p-6">
                    <ul className="space-y-2">
                      {item.item.details.map((detail, idx) => (
                        <li key={idx} className="text-white/80">{detail}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              )
            )}

            {/* Related Items */}
            <section
              className={`mb-12 ${isLoaded ? contentEnter : ''}`}
            >
              <h2 className="text-2xl font-semibold mb-6">Related Items</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 w-[260px] min-h-[260px] bg-ff-black rounded-lg overflow-hidden flex flex-col"
                    >
                      <div className="w-full h-[160px] bg-slate-800 animate-pulse" />
                      <div className="flex-1 flex flex-col justify-between py-3 px-3">
                        <Skeleton className="h-6 w-3/4 mx-auto mb-3" />
                        <div className="flex items-center justify-center gap-4">
                          {Array.from({ length: 3 }).map((__, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <Skeleton className="w-[26px] h-[26px]" />
                              <Skeleton className="h-4 w-8" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  relatedItems.map((relatedItem, idx) => {
                    const formatCount = (count: number) => {
                      if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
                      return count.toString();
                    };

                    return (
                      <Link
                        key={idx}
                        href="/items/related-item"
                        className="flex-shrink-0 w-[260px] min-h-[260px] bg-ff-black rounded-lg overflow-hidden flex flex-col hover:opacity-90 transition-opacity"
                      >
                        {/* Product Image */}
                        <div className="relative w-full h-[160px] flex-shrink-0">
                          {relatedItem.image ? (
                            <Image
                              src={relatedItem.image}
                              alt={relatedItem.title || ''}
                              fill
                              className="object-contain"
                              sizes="260px"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                              <span className="text-white/40 text-sm">No image</span>
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 flex flex-col justify-between py-3 px-3">
                          {/* Title */}
                          <h3 className="text-white text-[16px] font-medium line-clamp-2 mb-3 text-center">
                            {relatedItem.title || 'Untitled'}
                          </h3>

                          {/* Engagement Metrics */}
                          <div className="flex items-center justify-center gap-4">
                            {/* Rating */}
                            <div className="flex flex-col items-center gap-1">
                              <Star className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
                              <span className="text-white text-[14px]">{relatedItem.rating}</span>
                            </div>

                            {/* View Count */}
                            <div className="flex flex-col items-center gap-1">
                              <Eye className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
                              <span className="text-white text-[14px]">{formatCount(relatedItem.views)}</span>
                            </div>

                            {/* Comment Count */}
                            <div className="flex flex-col items-center gap-1">
                              <MessageCircle className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
                              <span className="text-white text-[14px]">{relatedItem.comments}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>

        {/* Lists that include this item */}
        <section
          className={`mb-12 ${isLoaded ? contentEnter : ''}`}
        >
          <h2 className="text-2xl font-semibold mb-6">Lists that include this item</h2>
          <div className="text-white/60">Coming soon...</div>
        </section>
          </>
        )}
      </div>
    </main>
  );
}
