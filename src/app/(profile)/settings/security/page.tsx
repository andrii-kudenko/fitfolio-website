"use client";

import { useState } from "react";

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  async function handleUpdate() {
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "err", text: "Please fill in all fields." });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "err",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "err", text: "Passwords do not match." });
      return;
    }

    const raw = localStorage.getItem("fitfolio_logged_in");
    if (!raw) {
      setMessage({ type: "err", text: "You are not logged in." });
      return;
    }

    const user = JSON.parse(raw);

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8080/api/users/${user.id}/change-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );
      

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Incorrect Password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage({ type: "ok", text: "Password updated successfully." });
    } catch (err: any) {
      setMessage({
        type: "err",
        text: err.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[28px] font-bold text-white">Security</h2>
        <p className="text-sm text-white/60">Change your password.</p>
      </div>

      {message && (
        <div
          className={
            message.type === "ok"
              ? "rounded-xl border border-ff-cyan/40 bg-ff-cyan/10 px-4 py-3 text-white"
              : "rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-100"
          }
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-white/90 mb-2">
          Current password
        </label>
        <input
          type="password"
          className="w-full h-12 px-4 rounded-xl bg-[#000500] text-white placeholder:text-white/40 outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-ff-cyan transition"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/90 mb-2">
          New password
        </label>
        <input
          type="password"
          className="w-full h-12 px-4 rounded-xl bg-[#000500] text-white placeholder:text-white/40 outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-ff-cyan transition"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 6 characters"
          disabled={loading}
        />
        <p className="text-xs text-white/50 mt-2">Use 6+ characters.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white/90 mb-2">
          Confirm new password
        </label>
        <input
          type="password"
          className="w-full h-12 px-4 rounded-xl bg-[#000500] text-white placeholder:text-white/40 outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-ff-cyan transition"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          disabled={loading}
        />
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className={`w-full sm:w-auto px-6 h-12 rounded-xl bg-[#1E90FF] text-white font-semibold transition ${
          loading ? "opacity-60 cursor-not-allowed" : "hover:brightness-110"
        }`}
      >
        {loading ? "Updating..." : "Update password"}
      </button>
    </div>
  );
}
