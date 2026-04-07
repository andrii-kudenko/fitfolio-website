"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { isAxiosError } from "axios";
import type { UserProfileResponse } from "@/features/users/types/users.types";
import { usersApi } from "@/features/users/api/users.api";
import { CollectionsTab } from "@/features/collections/components/CollectionsTab";
import { TierListsTab } from "@/features/tierlists/components/TierListsTab";
import { UserReviewsTab } from "@/features/reviews/components/UserReviewsTab";
import { ProfileFollowList } from "@/features/users/components/ProfileFollowList";

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
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const username = params.username as string;

  const isOwnProfile = profile && loggedInUser && profile.userId === loggedInUser.id;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const data = localStorage.getItem("fitfolio_logged_in");
    if (!data) return;
    try {
      setLoggedInUser(JSON.parse(data));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      if (!username) return;
      try {
        setLoading(true);
        setError(null);
        const profileData = await usersApi.getProfileByUsername(username);
        setProfile(profileData);
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 404) {
          setError("Profile not found");
        } else {
          setError("Something went wrong. Please try again.");
        }
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (!profile || !loggedInUser || loggedInUser.id === profile.userId) {
      setFollowing(false);
      return;
    }
    let cancelled = false;
    usersApi
      .getFollowStatus(profile.userId)
      .then((s) => {
        if (!cancelled) setFollowing(s.following);
      })
      .catch(() => {
        if (!cancelled) setFollowing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile?.userId, loggedInUser?.id]);

  const toggleFollow = useCallback(async () => {
    if (!profile || !loggedInUser || isOwnProfile || followBusy) return;
    setFollowBusy(true);
    const next = !following;
    setFollowing(next);
    try {
      if (next) {
        await usersApi.follow(profile.userId);
        setProfile((p) =>
          p ? { ...p, followersCount: p.followersCount + 1 } : null
        );
      } else {
        await usersApi.unfollow(profile.userId);
        setProfile((p) =>
          p
            ? { ...p, followersCount: Math.max(0, p.followersCount - 1) }
            : null
        );
      }
    } catch {
      setFollowing(!next);
    } finally {
      setFollowBusy(false);
    }
  }, [profile, loggedInUser, isOwnProfile, followBusy, following]);

  if (loading) {
    return (
      <main className="min-h-screen text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-8">
          <div className="text-slate-400">Loading profile...</div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-8">
          <div className="text-red-400">
            {error || "Profile not found"}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto flex max-w-6xl flex-col px-4 py-8">
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-slate-800">
          <div className="relative h-64 w-full md:h-80">
            <img
              src="/profile-bg2.jpg"
              alt="Profile banner"
              className="h-full w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative -mt-20 px-6 pb-6 md:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-4">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-black bg-slate-700">
                  <img
                    src={profile.avatarUrl || "/face.jpg"}
                    alt={profile.username}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold">
                      @{profile.username}
                    </h1>
                    {isOwnProfile ? (
                      <Link
                        href="/settings/profile"
                        className="rounded-full bg-sky-500 px-4 py-1 text-sm font-medium hover:bg-sky-400"
                      >
                        Edit profile
                      </Link>
                    ) : loggedInUser ? (
                      <button
                        type="button"
                        disabled={followBusy}
                        onClick={toggleFollow}
                        className={
                          following
                            ? "rounded-full border border-white/30 bg-transparent px-4 py-1 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
                            : "rounded-full bg-ff-cyan px-4 py-1 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-50"
                        }
                      >
                        {followBusy ? "…" : following ? "Unfollow" : "Follow"}
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        className="rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/15"
                      >
                        Sign in to follow
                      </Link>
                    )}
                  </div>

                  <p className="mt-2 max-w-xl text-sm text-slate-200">
                    {profile.bio || "No bio available"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs md:grid-cols-5">
                <ProfileStat
                  label="COLLECTIONS"
                  value={profile.collectionsCount.toString()}
                />
                <ProfileStat
                  label="TIER LISTS"
                  value={profile.tierListsCount.toString()}
                />
                <ProfileStat
                  label="FOLLOWING"
                  value={profile.followingCount.toString()}
                />
                <ProfileStat
                  label="FOLLOWERS"
                  value={profile.followersCount.toString()}
                />
              </div>
            </div>

            <div className="mt-8 flex w-max gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-2 py-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-1 text-sm transition ${
                    activeTab === tab
                      ? "bg-white font-medium text-black"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6">
          {activeTab === "Reviews" && (
            <UserReviewsTab
              userId={profile.userId}
              username={profile.username}
              avatarUrl={profile.avatarUrl}
            />
          )}
          {activeTab === "Collections" && (
            <CollectionsTab userId={profile.userId} username={username} />
          )}
          {activeTab === "Tier-lists" && (
            <TierListsTab userId={profile.userId} username={username} />
          )}
          {activeTab === "Following" && (
            <div>
              <h2 className="mb-4 text-sm font-semibold text-slate-300">
                Following
              </h2>
              <ProfileFollowList
                profileUserId={profile.userId}
                mode="following"
              />
            </div>
          )}
          {activeTab === "Followers" && (
            <div>
              <h2 className="mb-4 text-sm font-semibold text-slate-300">
                Followers
              </h2>
              <ProfileFollowList
                profileUserId={profile.userId}
                mode="followers"
              />
            </div>
          )}
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
      <div className="mt-1 text-[10px] tracking-wide text-slate-400">
        {label}
      </div>
    </div>
  );
}
