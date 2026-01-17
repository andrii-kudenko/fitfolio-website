"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export default function OnboardingPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load pending login user data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingLogin = localStorage.getItem("fitfolio_pending_login");
      if (pendingLogin) {
        try {
          const userData = JSON.parse(pendingLogin);
          setUser(userData);
        } catch (err) {
          // Invalid data, redirect to login
          router.push("/login");
        }
      } else {
        // No pending login, redirect to login
        router.push("/login");
      }
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!username.trim()) {
      setMessage("Username is required.");
      return;
    }

    if (username.length > 40) {
      setMessage("Username must be 40 characters or less.");
      return;
    }

    if (!user) {
      setMessage("User data not found. Please log in again.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:8080/api/users/${user.id}/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            bio: bio.trim() || null,
            avatarUrl: avatarUrl.trim() || null,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        setMessage(
          errorText || "Failed to create profile. Please try again."
        );
        return;
      }

      // Profile created successfully - log the user in
      if (typeof window !== "undefined") {
        // Remove pending login
        localStorage.removeItem("fitfolio_pending_login");
        // Set logged in user
        localStorage.setItem("fitfolio_logged_in", JSON.stringify(user));
      }

      // Redirect to home
      router.push("/");
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    // Still loading or redirecting
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* logo */}
      <div className="mt-10 mb-6 text-3xl font-semibold text-white">
        <span className="text-blue-400">FitFolio</span>
      </div>

      {/* form box */}
      <div className="w-full max-w-md bg-[#040707] border border-gray-700 rounded-md p-6">
        <h1 className="text-2xl font-semibold mb-4 text-white">
          Complete Your Profile
        </h1>

        <p className="text-sm text-gray-400 mb-4">
          Welcome to FitFolio! Please complete your profile to get started.
        </p>

        {message && (
          <p className="mb-3 text-sm text-red-400">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-white">
              Username <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              maxLength={40}
              required
            />
            <p className="text-xs text-gray-500">
              This will be your public username (max 40 characters)
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-white">Bio</label>
            <textarea
              className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white min-h-[100px] resize-y"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself (optional)"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-white">Avatar URL</label>
            <input
              type="url"
              className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg (optional)"
            />
            <p className="text-xs text-gray-500">
              You can add or change your avatar later
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 text-sm font-medium rounded-sm bg-[#1e90ff] text-white hover:bg-[#1879d9] disabled:opacity-60"
          >
            {loading ? "Creating Profile..." : "Complete Profile"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-400">
          You can update your profile later in settings.
        </p>
      </div>
    </div>
  );
}
