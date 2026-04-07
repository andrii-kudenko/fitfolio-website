"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { UserProfileResponse } from "@/features/users/types/users.types";
import { CollectionsTab } from "@/features/collections/components/CollectionsTab";
import { TierListsTab } from "@/features/tierlists/components/TierListsTab";
import { UserReviewsTab } from "@/features/reviews/components/UserReviewsTab";

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
          <div className="text-red-400">{error || "Profile not found"}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white">
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
                    {/* {isOwnProfile ? (
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
                    )} */}
                  </div>

                  <p className="mt-2 max-w-xl text-sm text-slate-200">
                    {profile.bio || "No bio available"}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs md:grid-cols-5">
                {/* <ProfileStat label="ITEMS/REVIEWS" value="315" /> */}
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
          {activeTab === "Reviews" && (
            <UserReviewsTab
              userId={profile.userId}
              username={profile.username}
              avatarUrl={profile.avatarUrl}
            />
          )}          
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
