"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountPage() {
  const router = useRouter();

  const [confirmChecked, setConfirmChecked] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Get username + id from localStorage (logged in user + profile cache)
  const { userId, expectedUsername } = useMemo(() => {
    if (typeof window === "undefined") return { userId: null as string | null, expectedUsername: "" };

    let id: string | null = null;
    let username = "";

    try {
      const rawUser = localStorage.getItem("fitfolio_logged_in");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        id = u?.id ?? null;
      }
    } catch {}

    try {
      const rawProfile = localStorage.getItem("fitfolio_user_profile");
      if (rawProfile) {
        const p = JSON.parse(rawProfile);
        username = p?.username ?? "";
      }
    } catch {}

    // Fallback: sometimes username might be stored on loggedInUser
    if (!username) {
      try {
        const rawUser = localStorage.getItem("fitfolio_logged_in");
        if (rawUser) {
          const u = JSON.parse(rawUser);
          username = u?.username ?? "";
        }
      } catch {}
    }

    return { userId: id, expectedUsername: username };
  }, []);

  const canDelete =
    confirmChecked &&
    !!userId &&
    !!expectedUsername &&
    confirmText.trim().toLowerCase() === expectedUsername.trim().toLowerCase();

  async function handleDelete() {
    setMessage(null);

    if (!confirmChecked) {
      setMessage({ type: "err", text: "Please check the confirmation box first." });
      return;
    }

    if (!userId) {
      setMessage({ type: "err", text: "You are not logged in." });
      return;
    }

    if (!expectedUsername) {
      setMessage({
        type: "err",
        text: "Username not found. Visit your profile once (so it caches) and try again.",
      });
      return;
    }

    if (!canDelete) {
      setMessage({
        type: "err",
        text: `Type your username "${expectedUsername}" to confirm.`,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete account.");
      }

      // Clear local storage after successful deletion
      if (typeof window !== "undefined") {
        localStorage.removeItem("fitfolio_logged_in");
        localStorage.removeItem("fitfolio_user_profile");
        localStorage.removeItem("fitfolio_settings_profile");
        localStorage.removeItem("fitfolio_settings_privacy");
        localStorage.removeItem("fitfolio_settings_notifications");
        localStorage.removeItem("fitfolio_settings_preferences");
      }

      setMessage({ type: "ok", text: "Account deleted successfully." });

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 800);
    } catch (err: any) {
      setMessage({
        type: "err",
        text: err?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Danger</h2>
        <p className="text-sm text-gray-300">Deleting your account is permanent and cannot be undone.</p>
      </div>

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

      <div className="w-full bg-[#040707] border border-red-500/40 rounded-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Delete account</h3>

        <p className="text-sm text-gray-300">
          This will remove your account and related data permanently.
        </p>

        <label className="flex items-start gap-3 text-sm text-gray-200">
          <input
            type="checkbox"
            className="mt-1"
            checked={confirmChecked}
            onChange={(e) => setConfirmChecked(e.target.checked)}
            disabled={loading}
          />
          I understand this action is permanent.
        </label>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-white">
            Type your <span className="font-mono text-red-200">USERNAME</span> to confirm
          </label>
          <input
            type="text"
            className="border border-gray-600 rounded-sm px-3 py-2 text-sm bg-black text-white"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={expectedUsername ? expectedUsername : "@yourusername"}
            disabled={loading}
          />
          {expectedUsername && (
            <p className="text-xs text-gray-400">Confirm by typing: {expectedUsername}</p>
          )}
        </div>

        <button
          onClick={handleDelete}
          disabled={!canDelete || loading}
          className={`w-full mt-3 py-2 text-sm font-medium rounded-sm text-white ${
            canDelete && !loading ? "bg-red-600 hover:bg-red-700" : "bg-red-600 opacity-60 cursor-not-allowed"
          }`}
        >
          {loading ? "Deleting..." : "Delete my account"}
        </button>
      </div>
    </div>
  );
}
