"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import type { UserProfileResponse } from "@/features/users/types/users.types";
import type { CollectionResponse } from "@/features/collections/types/collections.types";
import { collectionsApi } from "@/features/collections/api/collections.api";
import { itemsApi } from "@/features/items/api/items.api";
import { tierlistsApi } from "@/features/tierlists/api/tierlists.api";
import type { TierListResponse, TierResponse } from "@/features/tierlists/types/tierlists.types";
import { Plus, Bookmark, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LoggedInUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const tabs = ["Reviews", "Collections", "Tier-lists", "Following", "Followers"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Reviews");
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const username = params.username as string;

  // Check if viewing own profile
  const isOwnProfile = profile && loggedInUser && profile.userId === loggedInUser.id;

  // Load logged-in user from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("fitfolio_logged_in");
      if (data) {
        try {
          const user = JSON.parse(data);
          setLoggedInUser(user);
        } catch {
          // Invalid data, ignore
        }
      }
    }
  }, []);

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        // Normalize username to lowercase for case-insensitive lookup
        const normalizedUsername = username.toLowerCase();

        const res = await fetch(
          `http://localhost:8080/api/users/by-username/${encodeURIComponent(normalizedUsername)}/profile`
        );

        if (!res.ok) {
          if (res.status === 404) {
            setError("Profile not found");
          } else {
            setError("Failed to load profile");
          }
          return;
        }

        const profileData: UserProfileResponse = await res.json();
        setProfile(profileData);
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <main className="min-h-screen bg-ff-black text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-8">
          <div className="text-slate-400">Loading profile...</div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-ff-black text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-8">
          <div className="text-red-400">{error || "Profile not found"}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ff-black text-white">
      <div className="mx-auto flex max-w-6xl flex-col px-4 py-8">
        {/* HEADER */}
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-slate-800">
          {/* Banner Image */}
          <div className="relative h-64 w-full md:h-80">
            <img
              src="/profile-bg2.jpg"
              alt="Profile banner"
              className="h-full w-full object-cover opacity-90"
            />
            {/* dark overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Profile info panel over the banner */}
          <div className="relative -mt-20 px-6 pb-6 md:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              {/* Avatar + name */}
              <div className="flex items-end gap-4">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-black bg-slate-700">
                  <img
                    src={profile.avatarUrl || "/face.jpg"}
                    alt={profile.username}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold">@{profile.username}</h1>
                    {isOwnProfile ? (
                      <>
                        <button className="rounded-full bg-sky-500 px-4 py-1 text-sm font-medium hover:bg-sky-400">
                          Edit Profile
                        </button>
                        <button className="rounded-full bg-slate-700 px-4 py-1 text-sm font-medium hover:bg-slate-600">
                          Create List
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="rounded-full bg-ff-cyan px-4 py-1 text-sm font-medium hover:bg-sky-400">
                          Follow
                        </button>
                        <span className="text-xl text-slate-400">⋯</span>
                      </>
                    )}
                  </div>

                  <p className="mt-2 max-w-xl text-sm text-slate-200">
                    {profile.bio || "No bio available"}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs md:grid-cols-5">
                <ProfileStat label="ITEMS/REVIEWS" value="315" />
                <ProfileStat label="COLLECTIONS" value={profile.collectionsCount.toString()} />
                <ProfileStat label="TIER LISTS" value={profile.tierListsCount.toString()} />
                <ProfileStat label="FOLLOWING" value={profile.followingCount.toString()} />
                <ProfileStat label="FOLLOWERS" value={profile.followersCount.toString()} />
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-8 flex w-max gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-2 py-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-1 text-sm transition ${
                    activeTab === tab
                      ? "bg-white text-black font-medium"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* TAB CONTENT */}
        <section className="mt-6">
          {activeTab === "Reviews" && <ReviewsTab />}
          {activeTab === "Collections" && profile && <CollectionsTab userId={profile.userId} username={username} />}
          {activeTab === "Tier-lists" && profile && <TierListsTab userId={profile.userId} username={username} />}
          {activeTab === "Following" && <FollowingTab />}
          {activeTab === "Followers" && <FollowersTab />}
        </section>
      </div>
    </main>
  );
}

type ProfileStatProps = {
  label: string;
  value: string;
};

function ProfileStat({ label, value }: ProfileStatProps) {
  return (
    <div className="rounded-2xl bg-slate-950/70 px-4 py-3">
      <div className="text-lg font-semibold">{value}</div>
      <div className="mt-1 text-[10px] tracking-wide text-slate-400">{label}</div>
    </div>
  );
}

/* ---------------- Review Tabs---------------- */

const mockReviews = [
  {
    id: 1,
    rating: 7,
    title: "Excellent fit and quality",
    itemName: "Nike Zoom Vomero Roam",
    author: "@andy",
    body: "Super comfortable and cool winter shoes, they fit perfectly.",
    details: "185 cm   82kg   Size 9.5",
    productImage: "placeholder-item.png",
    avatarImage: "placeholder-avatar.png",
  },
  {
    id: 2,
    rating: 7,
    title: "Excellent fit and quality",
    itemName: "Nike Zoom Vomero Roam",
    author: "@andy",
    body: "Super comfortable and cool winter shoes, they fit perfectly.",
    details: "185 cm   82kg   Size 9.5",
    productImage: "placeholder-item.png",
    avatarImage: "placeholder-avatar.png",
  },
  {
    id: 3,
    rating: 7,
    title: "Excellent fit and quality",
    itemName: "Nike Zoom Vomero Roam",
    author: "@andy",
    body: "Super comfortable and cool winter shoes, they fit perfectly.",
    details: "185 cm   82kg   Size 9.5",
    productImage: "placeholder-item.png",
    avatarImage: "placeholder-avatar.png",
  },
];

function ReviewsTab() {
  return (
    <div className="space-y-4">
      {mockReviews.map((review) => (
        <article
          key={review.id}
          className="overflow-hidden rounded-2xl border border-sky-700 bg-black/70 text-white"
        >
          {/* TOP STRIP: product image + name */}
          <div className="flex items-center justify-between bg-black px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
                <img
                  src="/tnf-jacket.jpg"
                  alt="TNf Jacket"
                  className="h-full w-full object-cover"
                />
                {/* <img
                  src={review.productImage}
                  alt={review.itemName}
                  className="h-full w-full object-cover"
                /> */}
              </div>
            </div>
            <div className="text-sm text-slate-100">{review.itemName}</div>
          </div>

          {/* MAIN BODY */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-1 text-sm text-yellow-400">
              <span className="text-base">{review.rating}</span>
              <span>★</span>
            </div>

            <h2 className="mt-1 text-xl font-semibold">{review.title}</h2>

            <div className="mt-3 flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-700">
                <img
                  src="/face.jpg"
                  alt={review.author}
                  className="h-full w-full object-cover"
                />
                {/* <img
                  src={review.avatarImage}
                  alt={review.author}
                  className="h-full w-full object-cover"
                /> */}
              </div>
              <div className="text-sm text-slate-200">{review.author}</div>
            </div>

            <div className="mt-2 text-xs text-slate-400">{review.details}</div>

            <p className="mt-3 text-sm text-slate-100">{review.body}</p>

            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
              <button className="hover:text-slate-200">👍 1</button>
              <button className="hover:text-slate-200">💬</button>
              <span>⋯</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ---------------- Collection Tab ---------------- */

interface CollectionWithItems extends CollectionResponse {
  topItems: Array<{
    id: string;
    imageUrl?: string;
  }>;
}

function CollectionsTab({ userId, username }: { userId: string; username: string }) {
  const [collections, setCollections] = useState<CollectionWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      try {
        setLoading(true);
        const collectionsPage = await collectionsApi.getForUser(userId, {
          size: 20,
        });

        // Fetch top 4 items for each collection
        const collectionsWithItems = await Promise.all(
          collectionsPage.content.map(async (collection) => {
            try {
              const itemsPage = await collectionsApi.getItems(collection.id, {
                size: 4,
                sort: collection.isRanked ? 'rank,asc' : 'createdAt,asc',
              });

              // Fetch item details for top 4 items
              const topItems = await Promise.all(
                itemsPage.content.slice(0, 4).map(async (collectionItem) => {
                  try {
                    const itemDetails = await itemsApi.getById(collectionItem.itemId);
                    return {
                      id: itemDetails.id,
                      imageUrl: itemDetails.imageUrl,
                    };
                  } catch {
                    return {
                      id: collectionItem.itemId,
                      imageUrl: undefined,
                    };
                  }
                })
              );

              return {
                ...collection,
                topItems,
              };
            } catch {
              return {
                ...collection,
                topItems: [],
              };
            }
          })
        );

        setCollections(collectionsWithItems);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchCollections();
    }
  }, [userId]);

  function formatCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-4 animate-pulse"
          >
            <div className="h-4 bg-slate-800 rounded w-3/4 mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-slate-800" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {collections.map((collection) => (
        <div
          key={collection.id}
          className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between text-sm mb-3">
            <h3 className="font-medium text-slate-100 truncate flex-1 mr-2">
              {collection.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
              <Bookmark className="w-3 h-3" />
              <span>{formatCount(collection.likeCount)}</span>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-2 gap-2">
            {collection.topItems.length > 0 ? (
              <>
                {collection.topItems.map((item) => (
                  <div
                    key={item.id}
                    className="h-20 rounded-lg bg-slate-800 overflow-hidden relative"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    ) : null}
                  </div>
                ))}
                {/* Fill remaining slots if less than 4 items */}
                {Array.from({ length: Math.max(0, 4 - collection.topItems.length) }).map(
                  (_, i) => (
                    <div
                      key={`placeholder-${i}`}
                      className="h-20 rounded-lg bg-slate-800"
                    />
                  )
                )}
              </>
            ) : (
              // No items - show 4 grey placeholders
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-slate-800" />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-700" />
              <span className="text-xs text-slate-400">@{username}</span>
            </div>
            <Link
              href={`/${username}/collections/${collection.slug}`}
              className="flex items-center gap-1 rounded-full bg-ff-cyan px-3 py-1.5 text-xs font-medium text-black hover:bg-ff-cyan/90 transition-colors"
            >
              View full collection
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ))}
      <Link
        href="/collections/new"
        className="group flex flex-col rounded-2xl border border-dashed border-slate-800 bg-slate-950/80 p-4 items-center justify-center cursor-pointer
         hover:border-ff-cyan transition-all duration-300"
      >
        <Plus className="size-[140px] text-ff-gray opacity-50 group-hover:opacity-100 group-hover:text-ff-cyan transition-all duration-300" strokeWidth={0.5} />
        <h3 className="font-medium text-ff-gray opacity-50 group-hover:opacity-100 group-hover:text-ff-cyan transition-all duration-300">Create new Collection</h3>
      </Link>
    </div>
  );
}

/* ---------------- Tier List Tabs---------------- */

interface TierListWithTiers extends TierListResponse {
  tiers: Array<{
    tier: TierResponse;
    items: Array<{
      id: string;
      imageUrl?: string;
    }>;
  }>;
}

function TierListsTab({ userId, username }: { userId: string; username: string }) {
  const [tierLists, setTierLists] = useState<TierListWithTiers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTierLists() {
      try {
        setLoading(true);
        const tierListsPage = await tierlistsApi.getForUser(userId, {
          size: 20,
        });

        // Fetch tiers and items for each tier list
        const tierListsWithTiers = await Promise.all(
          tierListsPage.content.map(async (tierList) => {
            try {
              // Fetch tiers for this tier list
              const tiers = await tierlistsApi.getTiers(tierList.id);
              
              // Sort tiers by position
              const sortedTiers = tiers.sort((a, b) => a.position - b.position);

              // Fetch items for each tier (limit to top 3 per tier)
              const tiersWithItems = await Promise.all(
                sortedTiers.slice(0, 3).map(async (tier) => {
                  try {
                    const itemsPage = await tierlistsApi.getItems(tierList.id, {
                      size: 50, // Get more items to filter by tier
                      sort: 'position,asc',
                    });

                    // Filter items for this specific tier and fetch item details
                    const tierItems = itemsPage.content
                      .filter(item => item.tierId === tier.id)
                      .slice(0, 3);

                    const itemsWithDetails = await Promise.all(
                      tierItems.map(async (tierItem) => {
                        try {
                          const itemDetails = await itemsApi.getById(tierItem.itemId);
                          return {
                            id: itemDetails.id,
                            imageUrl: itemDetails.imageUrl,
                          };
                        } catch {
                          return {
                            id: tierItem.itemId,
                            imageUrl: undefined,
                          };
                        }
                      })
                    );

                    return {
                      tier,
                      items: itemsWithDetails,
                    };
                  } catch {
                    return {
                      tier,
                      items: [],
                    };
                  }
                })
              );

              return {
                ...tierList,
                tiers: tiersWithItems,
              };
            } catch {
              return {
                ...tierList,
                tiers: [],
              };
            }
          })
        );

        setTierLists(tierListsWithTiers);
      } catch (error) {
        console.error('Error fetching tier lists:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchTierLists();
    }
  }, [userId]);

  function formatCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-4 animate-pulse"
          >
            <div className="h-4 bg-slate-800 rounded w-3/4 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-slate-800" />
                  <div className="flex flex-1 gap-2">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-12 flex-1 rounded-md bg-slate-800" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {tierLists.map((tierList) => (
        <div
          key={tierList.id}
          className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between text-sm mb-3">
            <h3 className="font-medium text-slate-100 truncate flex-1 mr-2">
              {tierList.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
              <Bookmark className="w-3 h-3" />
              <span>{formatCount(tierList.likeCount)}</span>
            </div>
          </div>

          {/* Tiers */}
          <div className="mt-3 space-y-2 text-xs">
            {tierList.tiers.length > 0 ? (
              tierList.tiers.map((tierWithItems) => {
                const tierLabel = tierWithItems.tier.label || tierWithItems.tier.name.charAt(0).toUpperCase();
                return (
                  <div key={tierWithItems.tier.id} className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] flex-shrink-0">
                      {tierLabel}
                    </div>
                    <div className="flex flex-1 gap-2">
                      {tierWithItems.items.length > 0 ? (
                        <>
                          {tierWithItems.items.map((item) => (
                            <div
                              key={item.id}
                              className="h-12 flex-1 rounded-md bg-slate-800 overflow-hidden relative"
                            >
                              {item.imageUrl ? (
                                <Image
                                  src={item.imageUrl}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 33vw, 25vw"
                                />
                              ) : null}
                            </div>
                          ))}
                          {/* Fill remaining slots if less than 3 items */}
                          {Array.from({ length: Math.max(0, 3 - tierWithItems.items.length) }).map(
                            (_, i) => (
                              <div
                                key={`placeholder-${i}`}
                                className="h-12 flex-1 rounded-md bg-slate-800"
                              />
                            )
                          )}
                        </>
                      ) : (
                        // No items - show 3 grey placeholders
                        Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-12 flex-1 rounded-md bg-slate-800" />
                        ))
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              // No tiers - show 3 placeholder tiers
              ["S", "A", "B"].map((tier) => (
                <div key={tier} className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px]">
                    {tier}
                  </div>
                  <div className="flex flex-1 gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 flex-1 rounded-md bg-slate-800" />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <Link
            href={`/${username}/tierlists/${tierList.slug}`}
            className="mt-3 w-max rounded-full bg-ff-cyan px-3 py-1 text-xs font-medium text-black hover:bg-ff-cyan/90 transition-colors"
          >
            View full tier-list
          </Link>
        </div>
      ))}
      <Link
        href="/tierlists/new"
        className="group flex flex-col rounded-2xl border border-dashed border-slate-800 bg-slate-950/80 p-4 items-center justify-center cursor-pointer
         hover:border-ff-cyan transition-all duration-300"
      >
        <Plus className="size-[140px] text-ff-gray opacity-50 group-hover:opacity-100 group-hover:text-ff-cyan transition-all duration-300" strokeWidth={0.5} />
        <h3 className="font-medium text-ff-gray opacity-50 group-hover:opacity-100 group-hover:text-ff-cyan transition-all duration-300">Create new Tier-list</h3>
      </Link>
    </div>
  );
}

/* ---------------- Following / Followers ---------------- */

const mockUsers = Array.from({ length: 9 }).map((_, i) => ({
  id: i + 1,
  handle: "ferguson231",
  summary: "402 followers, following 21",
}));

function FollowingTab() {
  return <UserList label="Following" />;
}

function FollowersTab() {
  return <UserList label="Followers" />;
}

function UserList({ label }: { label: string }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-semibold text-slate-300">{label}</h2>
      <div className="grid gap-3 md:grid-cols-4">
        {mockUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-3"
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-100">
                {user.handle}
              </div>
              <div className="text-[11px] text-slate-400">{user.summary}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
