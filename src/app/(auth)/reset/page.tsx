"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PasswordAssistancePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      // TODO later: call backend to initiate password reset
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Skip verification code step and go straight to new password
      router.push(
        `/reset/new-password?email=${encodeURIComponent(normalizedEmail)}`
      );
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Logo */}
      <div className="mt-10 mb-6 text-3xl font-semibold text-white">
        <span className="text-blue-400">FitFolio</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-xl bg-[#040707] border border-gray-700 rounded-md p-8 shadow-lg">
        <h1 className="text-2xl font-semibold mb-4">Password assistance</h1>

        <p className="text-sm text-gray-300 mb-5">
          Enter the email address associated with your FitFolio account.
        </p>

        {message && (
          <p className="mb-3 text-sm text-red-400">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold">E-mail address</label>
            <input
              type="email"
              className="border border-gray-600 rounded-sm px-3 py-2 text-sm bg-black text-white outline-none focus:ring-1 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-2 text-sm font-medium rounded-sm bg-blue-500 hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Continuing..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
