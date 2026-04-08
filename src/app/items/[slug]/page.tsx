'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Eye, MessageCircle, Search, ChevronRight, HeartIcon, HeartCrackIcon, HeartPlus } from 'lucide-react';
import { itemsApi } from '@/features/items/api/items.api';
import { ItemFullResponse } from '@/features/items/types/items.types';
import { useParams } from 'next/navigation';
import { reviewsApi } from '@/features/reviews/api/reviews.api';
import { ReviewResponse, ReviewPage } from '@/features/reviews/types/reviews.types';
import { usersApi } from '@/features/users/api/users.api';
import { UserProfileResponse, FitProfileResponse } from '@/features/users/types/users.types';
import CommentsSection from '@/features/comments/CommentsSection';
import { ItemReviewsTab } from '@/features/reviews/components/ItemReviewsTab';

// Mock related items
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
  const [activeTab, setActiveTab] = useState<'reviews' | 'comments'>('reviews');
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfileResponse>>({});
  const [fitProfiles, setFitProfiles] = useState<Record<string, FitProfileResponse>>({});
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
      .getBySlugDetail(slug, readLoggedInUserId())
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

  // Fetch reviews when item is loaded
  useEffect(() => {
    if (!item?.item?.id) return;

    setReviewsLoading(true);
    reviewsApi
      .getForItem(item.item.id, { sort: sortBy === 'newest' ? 'createdAt,desc' : 'createdAt,asc' })
      .then((reviewPage: ReviewPage) => {
        setReviews(reviewPage.content || []);
        
        // Fetch user profiles and fit profiles for each review
        const userIds = [...new Set(reviewPage.content?.map(r => r.userId) || [])];
        
        // Fetch user profiles
        const profilePromises = userIds.map(userId => 
          usersApi.getProfile(userId)
            .then((profile: UserProfileResponse) => ({ userId, profile }))
            .catch(() => null)
        );
        
        // Fetch fit profiles
        const fitProfilePromises = userIds.map(userId =>
          usersApi.getFitProfile(userId)
            .then((fitProfile: FitProfileResponse) => ({ userId, fitProfile }))
            .catch(() => null)
        );
        
        Promise.all([...profilePromises, ...fitProfilePromises]).then((results: Array<{ userId: string; profile?: UserProfileResponse; fitProfile?: FitProfileResponse } | null>) => {
          const profiles: Record<string, UserProfileResponse> = {};
          const fitProfilesData: Record<string, FitProfileResponse> = {};
          
          results.forEach(result => {
            if (result) {
              if ('profile' in result && result.profile) {
                profiles[result.userId] = result.profile;
              }
              if ('fitProfile' in result && result.fitProfile) {
                fitProfilesData[result.userId] = result.fitProfile;
              }
            }
          });
          
          setUserProfiles(profiles);
          setFitProfiles(fitProfilesData);
        });
      })
      .catch((err) => {
        console.error('Error fetching reviews:', err);
      })
      .finally(() => setReviewsLoading(false));
  }, [item?.item?.id, sortBy]);

  const isLoaded = !!item && !loading && !error;
  const ease = 'ease-[cubic-bezier(.2,.8,.2,1)]';
  const contentEnter = `transition-all duration-700 ${ease} will-change-[opacity,transform,filter] ${reveal ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-2 blur-sm'}`;
  const overlayLeave = `transition-opacity duration-700 ${ease} ${reveal ? 'opacity-0' : 'opacity-100'}`;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Breadcrumbs */}
        {/* <nav className="mb-6 text-sm text-white/60">
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
        </nav> */}

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
                      <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
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

              <div
                className={`grid grid-cols-1 gap-8 min-w-0 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] ${isLoaded ? contentEnter : ''}`}
              >
                {/* Product Image (~30%) */}
                <div className="relative min-w-0">
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    {loading ? (
                      <div className="w-full h-full bg-slate-800 animate-pulse" />
                    ) : item?.item.imageUrl ? (
                      <>
                        <Image
                          src={item.item.imageUrl}
                          alt={item.item.name || ''}
                          fill
                          className="object-contain"
                          sizes="(max-width: 1023px) 100vw, 30vw"
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

                {/* Product Information (~70%) */}
                <div className="min-w-0 space-y-6">
                  {/* Status Label */}
                  {/* <div>
                    {loading ? (
                      <Skeleton className="h-6 w-24 rounded-full" />
                    ) : (
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                        Unverified
                      </span>
                    )}
                  </div> */}

                  {/* Brand */}
                  {loading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    item?.brand?.name && (
                      <div className="text-sm text-white/60">
                        {item.brand.name}
                        {item.item.department
                          ? ` - ${item.item.department.charAt(0).toUpperCase()}${item.item.department.slice(1)}`
                          : ''}
                        {item.category?.name && ` - ${item.category.name}`}
                      </div>
                    )
                  )}

                  {/* Title + Subtitle */}
                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl md:text-4xl font-semibold">{item?.item.name || ''}</h1>                      
                    </>
                  )}

                  {/* Rating */}
                  {loading ? (
                    <Skeleton className="h-8 w-36" />
                  ) : (
                    <div
                      className="flex transition-all duration-300 gap-3
                      bg-black/80 rounded-br-xl"
                    >
                        <div className="flex items-center justify-center gap-[6px]">
                          <Star className="text-yellow-200 size-8" strokeWidth={1.5} />
                        <span className="text-white text-xl font-medium">8.9</span>
                      </div>
                    </div>
                  )}

                  {/* Metrcis */}
                  <div
                    className="flex rounded-tl-xl transition-all duration-300 gap-6 bg-black/80"
                  >
                    <div className="flex flex-col items-center gap-[1px]">
                      <HeartIcon className="text-ff-cyan size-8" strokeWidth={1.5} />
                      <span className="text-white text-base">1.2k</span>
                    </div>
                    <div className="flex flex-col items-center gap-[1px]">
                      <Eye className="text-ff-cyan size-8" strokeWidth={1.5} />
                      <span className="text-white text-base">20k</span>
                    </div>
                    <div className="flex flex-col items-center gap-[1px]">
                      <MessageCircle className="text-ff-cyan size-8" strokeWidth={1.5} />
                      <span className="text-white text-base">326</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-white/70 text-base">
                    {item?.item.description}
                  </div>

                  {/* Tags */}
               
                </div>
              </div>
            </section>

        {/* Details Section */}
        {/* Related Items */}          
        {/* Lists that include this item */}
        {/* Reviews Section */}
        <section
          className={`mb-12 ${isLoaded ? contentEnter : ''}`}
        >
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'reviews'
                  ? 'bg-ff-blue text-white'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === 'comments'
                  ? 'bg-ff-blue text-white'
                  : 'bg-black text-white hover:bg-white/10'
              }`}
            >
              Comments
            </button>
          </div>

          {activeTab === 'reviews' && (
            <ItemReviewsTab
              slug={slug}
              reviews={reviews}
              reviewsLoading={reviewsLoading}
              sortBy={sortBy}
              onSortChange={setSortBy}
              userProfiles={userProfiles}
              fitProfiles={fitProfiles}
            />
          )}

          {activeTab === 'comments' && item?.item?.id && (
            <CommentsSection subjectType="ITEM" subjectId={item.item.id} />
          )}
        </section>
          </>
        )}
      </div>
    </main>
  );
}


// export default function ItemPage() {
//   const [imageZoom, setImageZoom] = useState(false);
//   const [item, setItem] = useState<ItemFullResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [reveal, setReveal] = useState(false);
//   const [showSkeletonOverlay, setShowSkeletonOverlay] = useState(true);
//   const [activeTab, setActiveTab] = useState<'reviews' | 'comments'>('reviews');
//   const [reviews, setReviews] = useState<ReviewResponse[]>([]);
//   const [reviewsLoading, setReviewsLoading] = useState(false);
//   const [sortBy, setSortBy] = useState('newest');
//   const [userProfiles, setUserProfiles] = useState<Record<string, UserProfileResponse>>({});
//   const [fitProfiles, setFitProfiles] = useState<Record<string, FitProfileResponse>>({});
//   const relatedItems = mockRelatedItems;
//   const params = useParams();
//   const slug = params.slug as string;

//   useEffect(() => {
//     setLoading(true);
//     setError(null);
//     setItem(null);
//     setReveal(false);
//     setShowSkeletonOverlay(true);

//     itemsApi
//       .getBySlugFull(slug)
//       .then(setItem)
//       .catch((err) => {
//         console.error('Error fetching item:', err);
//         setError('Failed to load item');
//       })
//       .finally(() => setLoading(false));
//   }, [slug]);

//   useEffect(() => {
//     if (!loading && item && !error) {
//       // Double rAF ensures the "hidden" classes paint before we flip to "visible"
//       // so the browser animates instead of jumping.
//       let raf1 = 0;
//       let raf2 = 0;
//       raf1 = window.requestAnimationFrame(() => {
//         raf2 = window.requestAnimationFrame(() => setReveal(true));
//       });

//       const t = window.setTimeout(() => setShowSkeletonOverlay(false), 750);

//       return () => {
//         window.cancelAnimationFrame(raf1);
//         window.cancelAnimationFrame(raf2);
//         window.clearTimeout(t);
//       };
//     }

//     if (!loading && error) {
//       setShowSkeletonOverlay(false);
//     }
//   }, [loading, item, error]);

//   // Fetch reviews when item is loaded
//   useEffect(() => {
//     if (!item?.item?.id) return;

//     setReviewsLoading(true);
//     reviewsApi
//       .getForItem(item.item.id, { sort: sortBy === 'newest' ? 'createdAt,desc' : 'createdAt,asc' })
//       .then((reviewPage: ReviewPage) => {
//         setReviews(reviewPage.content || []);
        
//         // Fetch user profiles and fit profiles for each review
//         const userIds = [...new Set(reviewPage.content?.map(r => r.userId) || [])];
        
//         // Fetch user profiles
//         const profilePromises = userIds.map(userId => 
//           usersApi.getProfile(userId)
//             .then((profile: UserProfileResponse) => ({ userId, profile }))
//             .catch(() => null)
//         );
        
//         // Fetch fit profiles
//         const fitProfilePromises = userIds.map(userId =>
//           usersApi.getFitProfile(userId)
//             .then((fitProfile: FitProfileResponse) => ({ userId, fitProfile }))
//             .catch(() => null)
//         );
        
//         Promise.all([...profilePromises, ...fitProfilePromises]).then((results: Array<{ userId: string; profile?: UserProfileResponse; fitProfile?: FitProfileResponse } | null>) => {
//           const profiles: Record<string, UserProfileResponse> = {};
//           const fitProfilesData: Record<string, FitProfileResponse> = {};
          
//           results.forEach(result => {
//             if (result) {
//               if ('profile' in result && result.profile) {
//                 profiles[result.userId] = result.profile;
//               }
//               if ('fitProfile' in result && result.fitProfile) {
//                 fitProfilesData[result.userId] = result.fitProfile;
//               }
//             }
//           });
          
//           setUserProfiles(profiles);
//           setFitProfiles(fitProfilesData);
//         });
//       })
//       .catch((err) => {
//         console.error('Error fetching reviews:', err);
//       })
//       .finally(() => setReviewsLoading(false));
//   }, [item?.item?.id, sortBy]);

//   const isLoaded = !!item && !loading && !error;
//   const ease = 'ease-[cubic-bezier(.2,.8,.2,1)]';
//   const contentEnter = `transition-all duration-700 ${ease} will-change-[opacity,transform,filter] ${reveal ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-2 blur-sm'}`;
//   const overlayLeave = `transition-opacity duration-700 ${ease} ${reveal ? 'opacity-0' : 'opacity-100'}`;

//   return (
//     <main className="min-h-screen bg-black text-white">
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Breadcrumbs */}
//         {/* <nav className="mb-6 text-sm text-white/60">
//           <div className="flex items-center gap-2">
//             <Link href="/" className="hover:text-white">Home</Link>
//             <ChevronRight className="w-4 h-4" />
//             <Link href="/items" className="hover:text-white">Sneakers</Link>
//             <ChevronRight className="w-4 h-4" />
//             {loading ? (
//               <Skeleton className="h-4 w-28" />
//             ) : (
//               <span className="text-white underline">
//                 {item?.brand?.name || item?.item.name || 'Item'}
//               </span>
//             )}
//           </div>
//         </nav> */}

//         {error && !loading ? (
//           <div className="py-16 text-center">
//             <div className="text-red-400 text-sm">{error}</div>
//             <div className="mt-3">
//               <Link href="/items" className="text-ff-cyan hover:underline">Back to Items</Link>
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* Product Details Section */}
//             <section className="relative mb-12">
//               {/* Cross-fade overlay to hide the skeleton->content swap */}
//               {showSkeletonOverlay && (
//                 <div className={`pointer-events-none absolute inset-0 z-10 ${overlayLeave}`}>
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                     <div className="relative">
//                       <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
//                         <div className="w-full h-full bg-slate-800 animate-pulse" />
//                       </div>
//                     </div>

//                     <div className="space-y-6">
//                       <Skeleton className="h-6 w-24 rounded-full" />
//                       <Skeleton className="h-4 w-32" />

//                       <div className="space-y-3">
//                         <Skeleton className="h-10 w-full" />
//                         <Skeleton className="h-10 w-3/4" />
//                         <Skeleton className="h-5 w-1/2" />
//                       </div>

//                       <Skeleton className="h-8 w-36" />

//                       <div className="flex flex-wrap gap-2">
//                         {Array.from({ length: 4 }).map((_, i) => (
//                           <Skeleton key={i} className="h-8 w-28 rounded-full" />
//                         ))}
//                       </div>

//                       <div className="space-y-2">
//                         <Skeleton className="h-4 w-full" />
//                         <Skeleton className="h-4 w-full" />
//                         <Skeleton className="h-4 w-3/4" />
//                         <Skeleton className="h-4 w-24 mt-4" />
//                       </div>

//                       <div className="space-y-3 pt-4 border-t border-white/10">
//                         <Skeleton className="h-6 w-28" />
//                         <div className="p-3 bg-white/5 rounded-lg space-y-2">
//                           <Skeleton className="h-4 w-full" />
//                           <Skeleton className="h-4 w-24" />
//                         </div>
//                       </div>

//                       <div className="flex gap-4 pt-4">
//                         <Skeleton className="flex-1 h-12 rounded-lg" />
//                         <Skeleton className="flex-1 h-12 rounded-lg" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${isLoaded ? contentEnter : ''}`}>
//                 {/* Product Image */}
//                 <div className="relative">
//                   <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
//                     {loading ? (
//                       <div className="w-full h-full bg-slate-800 animate-pulse" />
//                     ) : item?.item.imageUrl ? (
//                       <>
//                         <Image
//                           src={item.item.imageUrl}
//                           alt={item.item.name || ''}
//                           fill
//                           className="object-contain"
//                           sizes="(max-width: 768px) 100vw, 50vw"
//                         />
//                         <button
//                           onClick={() => setImageZoom(!imageZoom)}
//                           className="absolute top-4 left-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
//                           aria-label="Zoom image"
//                         >
//                           <Search className="w-5 h-5" />
//                         </button>
//                       </>
//                     ) : (
//                       <div className="w-full h-full bg-slate-800 flex items-center justify-center">
//                         <span className="text-white/40">No image</span>
//                       </div>
//                     )}
//                   </div>

//                   {imageZoom && item?.item.imageUrl && (
//                     <div
//                       className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
//                       onClick={() => setImageZoom(false)}
//                     >
//                       <div className="relative w-full h-full max-w-4xl">
//                         <Image
//                           src={item.item.imageUrl}
//                           alt={item.item.name || ''}
//                           fill
//                           className="object-contain"
//                           sizes="100vw"
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Product Information */}
//                 <div className="space-y-6">
//                   {/* Status Label */}
//                   {/* <div>
//                     {loading ? (
//                       <Skeleton className="h-6 w-24 rounded-full" />
//                     ) : (
//                       <span className="inline-block px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
//                         Unverified
//                       </span>
//                     )}
//                   </div> */}

//                   {/* Brand */}
//                   {loading ? (
//                     <Skeleton className="h-4 w-32" />
//                   ) : (
//                     item?.brand?.name && (
//                       <div className="text-sm text-white/60">{item.brand.name}</div>
//                     )
//                   )}

//                   {/* Title + Subtitle */}
//                   {loading ? (
//                     <div className="space-y-3">
//                       <Skeleton className="h-10 w-full" />
//                       <Skeleton className="h-10 w-3/4" />
//                       <Skeleton className="h-5 w-1/2" />
//                     </div>
//                   ) : (
//                     <>
//                       <h1 className="text-3xl md:text-4xl font-semibold">{item?.item.name || ''}</h1>
//                       {item?.item.subTitle && (
//                         <p className="text-lg text-white/70">{item.item.subTitle}</p>
//                       )}
//                     </>
//                   )}

//                   {/* Rating */}
//                   {loading ? (
//                     <Skeleton className="h-8 w-36" />
//                   ) : (
//                     <div className="flex items-center gap-2">
//                       <span className="text-2xl font-semibold">
//                         ★{item?.item.rating ?? 0}
//                       </span>
//                       <span className="text-white/60">({item?.item.commentCount ?? 0})</span>
//                     </div>
//                   )}

//                   {/* Tags */}
//                   {loading ? (
//                     <div className="flex flex-wrap gap-2">
//                       {Array.from({ length: 4 }).map((_, i) => (
//                         <Skeleton key={i} className="h-8 w-28 rounded-full" />
//                       ))}
//                     </div>
//                   ) : (
//                     item?.item.details && item.item.details.length > 0 && (
//                       <div className="flex flex-wrap gap-2">
//                         {item.item.details.map((detail, idx) => (
//                           <span
//                             key={idx}
//                             className="px-4 py-1 text-sm rounded-full border border-white/20 bg-white/5"
//                           >
//                             {detail}
//                           </span>
//                         ))}
//                       </div>
//                     )
//                   )}

//                   {/* Description */}
//                   {loading ? (
//                     <div className="space-y-2">
//                       <Skeleton className="h-4 w-full" />
//                       <Skeleton className="h-4 w-full" />
//                       <Skeleton className="h-4 w-3/4" />
//                       <Skeleton className="h-4 w-24 mt-4" />
//                     </div>
//                   ) : (
//                     item?.item.description && (
//                       <div>
//                         <p className="text-white/80 leading-relaxed">{item.item.description}</p>
//                         <Link href="#details" className="text-ff-cyan hover:underline mt-2 inline-block">
//                           View Details
//                         </Link>
//                       </div>
//                     )
//                   )}

//                   {/* Retailers */}
//                   {/* <div className="space-y-3 pt-4 border-t border-white/10">
//                     <h3 className="text-lg font-medium">Where to Buy</h3>
//                     {loading ? (
//                       <div className="p-3 bg-white/5 rounded-lg space-y-2">
//                         <Skeleton className="h-4 w-full" />
//                         <Skeleton className="h-4 w-24" />
//                       </div>
//                     ) : (
//                       item?.item.sourceUrl && (
//                         <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
//                           <div>
//                             <div className="font-medium">{item.item.sourceUrl}</div>
//                             <div className="text-sm text-white/60">
//                               {typeof item.item.price === 'number' ? `$${item.item.price.toFixed(2)}` : 'Price not available'}
//                             </div>
//                           </div>
//                           {typeof item.item.price === 'number' ? (
//                             <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
//                               In stock
//                             </span>
//                           ) : (
//                             <span className="text-xs text-white/40">Check availability</span>
//                           )}
//                         </div>
//                       )
//                     )}
//                   </div> */}
//                 </div>
//               </div>
//             </section>

//             {/* Details Section */}
//             {loading ? (
//               <section id="details" className="mb-12">
//                 <Skeleton className="h-8 w-32 mb-4" />
//                 <div className="bg-white/5 rounded-lg p-6 space-y-2">
//                   {Array.from({ length: 5 }).map((_, i) => (
//                     <Skeleton key={i} className="h-4 w-full" />
//                   ))}
//                 </div>
//               </section>
//             ) : (
//               item?.item.details && item.item.details.length > 0 && (
//                 <section
//                   id="details"
//                   className={`mb-12 ${isLoaded ? contentEnter : ''}`}
//                 >
//                   <h2 className="text-2xl font-semibold mb-4">Details</h2>
//                   <div className="bg-white/5 rounded-lg p-6">
//                     <ul className="space-y-2">
//                       {item.item.details.map((detail, idx) => (
//                         <li key={idx} className="text-white/80">{detail}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 </section>
//               )
//             )}

//             {/* Related Items */}
//             {/* <section
//               className={`mb-12 ${isLoaded ? contentEnter : ''}`}
//             >
//               <h2 className="text-2xl font-semibold mb-6">Related Items</h2>
//               <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
//                 {loading ? (
//                   Array.from({ length: 5 }).map((_, idx) => (
//                     <div
//                       key={idx}
//                       className="flex-shrink-0 w-[260px] min-h-[260px] bg-black rounded-lg overflow-hidden flex flex-col"
//                     >
//                       <div className="w-full h-[160px] bg-slate-800 animate-pulse" />
//                       <div className="flex-1 flex flex-col justify-between py-3 px-3">
//                         <Skeleton className="h-6 w-3/4 mx-auto mb-3" />
//                         <div className="flex items-center justify-center gap-4">
//                           {Array.from({ length: 3 }).map((__, i) => (
//                             <div key={i} className="flex flex-col items-center gap-1">
//                               <Skeleton className="w-[26px] h-[26px]" />
//                               <Skeleton className="h-4 w-8" />
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   relatedItems.map((relatedItem, idx) => {
//                     const formatCount = (count: number) => {
//                       if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
//                       return count.toString();
//                     };

//                     return (
//                       <Link
//                         key={idx}
//                         href="/items/related-item"
//                         className="flex-shrink-0 w-[260px] min-h-[260px] bg-black rounded-lg overflow-hidden flex flex-col hover:opacity-90 transition-opacity"
//                       >
//                         <div className="relative w-full h-[160px] flex-shrink-0">
//                           {relatedItem.image ? (
//                             <Image
//                               src={relatedItem.image}
//                               alt={relatedItem.title || ''}
//                               fill
//                               className="object-contain"
//                               sizes="260px"
//                             />
//                           ) : (
//                             <div className="w-full h-full bg-slate-800 flex items-center justify-center">
//                               <span className="text-white/40 text-sm">No image</span>
//                             </div>
//                           )}
//                         </div>

//                         <div className="flex-1 flex flex-col justify-between py-3 px-3">
//                           <h3 className="text-white text-[16px] font-medium line-clamp-2 mb-3 text-center">
//                             {relatedItem.title || 'Untitled'}
//                           </h3>

//                           <div className="flex items-center justify-center gap-4">
//                             <div className="flex flex-col items-center gap-1">
//                               <Star className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
//                               <span className="text-white text-[14px]">{relatedItem.rating}</span>
//                             </div>

//                             <div className="flex flex-col items-center gap-1">
//                               <Eye className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
//                               <span className="text-white text-[14px]">{formatCount(relatedItem.views)}</span>
//                             </div>

//                             <div className="flex flex-col items-center gap-1">
//                               <MessageCircle className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
//                               <span className="text-white text-[14px]">{relatedItem.comments}</span>
//                             </div>
//                           </div>
//                         </div>
//                       </Link>
//                     );
//                   })
//                 )}
//               </div>
//             </section> */}

//         {/* Lists that include this item */}
//         {/* <section
//           className={`mb-12 ${isLoaded ? contentEnter : ''}`}
//         >
//           <h2 className="text-2xl font-semibold mb-6">Lists that include this item</h2>
//           <div className="text-white/60">Coming soon...</div>
//         </section> */}

//         {/* Reviews Section */}
//         <section
//           className={`mb-12 ${isLoaded ? contentEnter : ''}`}
//         >
//           {/* Tabs */}
//           <div className="flex gap-2 mb-6">
//             <button
//               onClick={() => setActiveTab('reviews')}
//               className={`px-6 py-2 rounded-lg font-medium transition ${
//                 activeTab === 'reviews'
//                   ? 'bg-ff-blue text-white'
//                   : 'bg-white/5 text-white hover:bg-white/10'
//               }`}
//             >
//               Reviews
//             </button>
//             <button
//               onClick={() => setActiveTab('comments')}
//               className={`px-6 py-2 rounded-lg font-medium transition ${
//                 activeTab === 'comments'
//                   ? 'bg-ff-blue text-white'
//                   : 'bg-black text-white hover:bg-white/10'
//               }`}
//             >
//               Comments
//             </button>
//           </div>

//           {activeTab === 'reviews' && (
//             <>
//               {/* Write Review Button */}
//               <Link
//                 href={`/items/${slug}/review`}
//                 className="block w-full px-4 py-3 mb-6 bg-white/5 border border-white/20 rounded-lg text-white/60 hover:border-white/40 hover:text-white transition text-left"
//               >
//                 + Write a review
//               </Link>

//               {/* Sort By */}
//               <div className="flex items-center gap-3 mb-6">
//                 <span className="text-white/60 text-sm font-medium">SORT BY</span>
//                 <div className="relative">
//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     className="appearance-none px-4 py-2 pr-8 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:border-ff-cyan focus:outline-none cursor-pointer"
//                   >
//                     <option value="newest">NEWEST</option>
//                     <option value="oldest">OLDEST</option>
//                     <option value="rating-high">HIGHEST RATING</option>
//                     <option value="rating-low">LOWEST RATING</option>
//                   </select>
//                   <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
//                 </div>
//               </div>

//               {/* Reviews List */}
//               {reviewsLoading ? (
//                 <div className="space-y-4">
//                   {Array.from({ length: 2 }).map((_, i) => (
//                     <Skeleton key={i} className="h-48 w-full rounded-lg" />
//                   ))}
//                 </div>
//               ) : reviews.length === 0 ? (
//                 <div className="text-center py-12 text-white/60">
//                   No reviews yet. Be the first to review this item!
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {reviews.map((review) => {
//                     const userProfile = userProfiles[review.userId];
//                     const fitProfile = fitProfiles[review.userId];
//                     const username = userProfile?.username || 'anonymous';
                    
//                     // Format fit profile info
//                     const fitInfo: string[] = [];
//                     if (fitProfile?.heightCm && fitProfile?.lengthUnit) {
//                       if (fitProfile.lengthUnit === 'in') {
//                         const totalInches = fitProfile.heightCm / 2.54;
//                         const feet = Math.floor(totalInches / 12);
//                         const inches = Math.round(totalInches % 12);
//                         fitInfo.push(`${feet}'${inches}"`);
//                       } else {
//                         fitInfo.push(`${fitProfile.heightCm} cm`);
//                       }
//                     }
//                     if (fitProfile?.weightKg && fitProfile?.weightUnit) {
//                       if (fitProfile.weightUnit === 'lbs') {
//                         // Convert kg to lbs for display
//                         const lbs = Math.round(fitProfile.weightKg / 0.453592);
//                         fitInfo.push(`${lbs}lbs`);
//                       } else {
//                         fitInfo.push(`${Math.round(fitProfile.weightKg)}kg`);
//                       }
//                     }
//                     if (review.purchasedSize) {
//                       fitInfo.push(`Size ${review.purchasedSize}`);
//                     }
                    
//                     return (
//                       <div
//                         key={review.id}
//                         className="bg-white/5 border border-white/10 rounded-lg p-6"
//                       >
//                         {/* Rating and Title */}
//                         <div className="flex items-start gap-4 mb-3">
//                           <div className="text-2xl font-semibold">
//                             {review.rating ? `${Math.round(review.rating)}★` : 'N/A'}
//                           </div>
//                           {review.title && (
//                             <h3 className="text-lg font-semibold flex-1">{review.title}</h3>
//                           )}
//                         </div>

//                         {/* User Info */}
//                         <div className="flex items-center gap-3 mb-4">
//                           <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
//                             {userProfile?.avatarUrl ? (
//                               <Image
//                                 src={userProfile.avatarUrl}
//                                 alt={username}
//                                 width={32}
//                                 height={32}
//                                 className="w-full h-full object-cover"
//                               />
//                             ) : (
//                               <span className="text-white/60 text-xs">
//                                 {username.charAt(0).toUpperCase()}
//                               </span>
//                             )}
//                           </div>
//                           <div className="flex items-center gap-2 text-sm flex-wrap">
//                             <span className="text-white/80">@{username}</span>
//                             {fitInfo.length > 0 && (
//                               <>
//                                 {fitInfo.map((info, idx) => (
//                                   <span key={idx} className="text-white/60">
//                                     {idx > 0 && <span className="text-white/40 mx-1">•</span>}
//                                     {info}
//                                   </span>
//                                 ))}
//                               </>
//                             )}
//                           </div>
//                         </div>

//                         {/* Review Text */}
//                         {review.text && (
//                           <p className="text-white/80 mb-4 leading-relaxed">{review.text}</p>
//                         )}

//                         {/* Engagement */}
//                         <div className="flex items-center gap-4">
//                           <button className="flex items-center gap-2 text-white/60 hover:text-white transition">
//                             <ThumbsUp className="w-4 h-4" />
//                             <span className="text-sm">{review.likeCount || 0}</span>
//                           </button>
//                           <button className="text-white/60 hover:text-white transition">
//                             <MoreHorizontal className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </>
//           )}

//           {activeTab === 'comments' && item?.item?.id && (
//             <CommentsSection subjectType="ITEM" subjectId={item.item.id} />
//           )}
//         </section>
//           </>
//         )}
//       </div>
//     </main>
//   );
// }
