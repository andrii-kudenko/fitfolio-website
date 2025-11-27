// testing comment

"use client";

import { useState } from "react";

const tabs = ["Reviews", "Collections", "Tier-lists", "Following", "Followers"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Reviews");
  const username = "kristoforik";

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-6xl flex-col px-4 py-8">
        {/* HEADER / HERO */}
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

          {/* Profile info panel OVER the banner */}
          <div className="relative -mt-20 px-6 pb-6 md:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              {/* Avatar + name */}
              <div className="flex items-end gap-4">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-black bg-slate-700">
                  <img
                    src="/face.jpg"
                    alt={username}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-semibold">{username}</h1>
                    <button className="rounded-full bg-sky-500 px-4 py-1 text-sm font-medium">
                      Follow
                    </button>
                    <span className="text-xl text-slate-400">⋯</span>
                  </div>

                  <p className="mt-2 max-w-xl text-sm text-slate-200">
                    BIO. Hello my name is Andy, I am a big fan of fashion — and I really
                    like to try and review new stuff, so subscribe to me and let me share
                    what I know about fashion with you!
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs md:grid-cols-5">
                <ProfileStat label="ITEMS/REVIEWS" value="315" />
                <ProfileStat label="COLLECTIONS" value="4" />
                <ProfileStat label="TIER LISTS" value="3" />
                <ProfileStat label="FOLLOWING" value="182" />
                <ProfileStat label="FOLLOWERS" value="2369" />
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
          {activeTab === "Collections" && <CollectionsTab />}
          {activeTab === "Tier-lists" && <TierListsTab />}
          {activeTab === "Following" && <FollowingTab />}
          {activeTab === "Followers" && <FollowersTab />}
        </section>
      </div>
    </main>
  );
}

/* --- small components --- */

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

/* ---------------- REVIEWS TAB ---------------- */

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

/* ---------------- COLLECTIONS TAB ---------------- */

const mockCollections = [
  "Top Autumn Items",
  "Top Autumn Items",
  "Top Nike T-shirts",
  "Top Autumn Items",
  "Top Autumn Items",
];

function CollectionsTab() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {mockCollections.map((title, idx) => (
        <div
          key={idx}
          className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
        >
          <div className="flex items-center justify-between text-sm">
            <h3 className="font-medium text-slate-100">{title}</h3>
            <span className="text-xs text-slate-400">1.2k</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-slate-800" />
            ))}
          </div>

          <button className="mt-3 w-max rounded-full bg-sky-500 px-3 py-1 text-xs font-medium text-white hover:bg-sky-400">
            View full list
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- TIER LISTS TAB ---------------- */

function TierListsTab() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
        >
          <div className="flex items-center justify-between text-sm">
            <h3 className="font-medium text-slate-100">Best Winter Shoes</h3>
            <span className="text-xs text-slate-400">1.2k</span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            {["S", "A", "B"].map((tier) => (
              <div key={tier} className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px]">
                  {tier}
                </div>
                <div className="flex flex-1 gap-2">
                  {Array.from({ length: 3 }).map((__, i) => (
                    <div key={i} className="h-12 flex-1 rounded-md bg-slate-800" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="mt-3 w-max rounded-full bg-sky-500 px-3 py-1 text-xs font-medium text-white hover:bg-sky-400">
            View full tier-list
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- FOLLOWING / FOLLOWERS ---------------- */

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
