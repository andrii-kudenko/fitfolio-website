"use client";

import { useEffect, useState } from "react";

type ProfileForm = {
  username: string;
  displayName: string;
  bio: string;
};

export default function ProfileSettingsPage() {
  const [form, setForm] = useState<ProfileForm>({
    username: "",
    displayName: "",
    bio: "",
  });

  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function getLoggedInUser() {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("fitfolio_logged_in");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const user = getLoggedInUser();
    if (!user?.id) return;

    (async () => {
      setLoading(true);
      setMessage(null);

      try {
        const res = await fetch(`http://localhost:8080/api/users/${user.id}/profile`);

        if (res.ok) {
          const data = await res.json();
          setForm({
            username: data.username ?? "",
            displayName: data.displayName ?? "",
            bio: data.bio ?? "",
          });
        } else {
          // If profile doesn't exist yet, just keep empty form
        }
      } catch {
        setMessage({ type: "err", text: "Failed to load profile." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    const user = getLoggedInUser();
    if (!user?.id) {
      setMessage({ type: "err", text: "You must be logged in." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`http://localhost:8080/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          displayName: form.displayName,
          bio: form.bio,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save");
      }

      const updated = await res.json();

      // Optional: keep your existing local cache updated
      localStorage.setItem("fitfolio_user_profile", JSON.stringify(updated));

      setMessage({ type: "ok", text: "Saved!" });
    } catch (e: any) {
      setMessage({ type: "err", text: e?.message || "Failed to save profile." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Profile</h2>

      {message && (
        <div
          className={
            message.type === "ok"
              ? "rounded-md border border-gray-700 bg-[#040707] px-4 py-3 text-white"
              : "rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-100"
          }
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-white">Username</label>
        <input
          className="border border-gray-600 rounded-sm px-3 py-2 text-sm bg-black text-white"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Enter your username here"
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-white">Display name</label>
        <input
          className="border border-gray-600 rounded-sm px-3 py-2 text-sm bg-black text-white"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          placeholder="Enter your display name here"
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-white">Bio</label>
        <textarea
          className="border border-gray-600 rounded-sm px-3 py-2 text-sm bg-black text-white"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Tell people about your style..."
          disabled={loading}
        />
      </div>

      <button
        onClick={save}
        disabled={loading}
        className={`py-2 px-6 text-sm font-medium rounded-sm bg-blue-500 text-white ${
          loading ? "opacity-60 cursor-not-allowed" : "hover:brightness-110"
        }`}
      >
        Save changes
      </button>
    </div>
  );
}
