"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Read email from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("fitfolio_reset_email");
    if (saved) {
      setEmail(saved.trim().toLowerCase());
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Missing email. Please restart password reset.");
      return;
    }

    if (!password.trim() || !password2.trim()) {
      setMessage("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== password2) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword: password,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        setMessage(text || "Password reset failed. Please try again.");
        return;
      }

      router.push("/login");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* logo */}
      <div className="mt-10 mb-6 text-3xl font-semibold text-white">
        <span className="text-blue-400">FitFolio</span>
      </div>

      {/* card */}
      <div className="w-full max-w-md bg-[#040707] border border-gray-700 rounded-md p-6">
        <h1 className="text-2xl font-semibold mb-2 text-white">
          Create new password
        </h1>

        <p className="text-xs text-gray-400 mb-4">
          We&apos;ll ask for this password whenever you sign in.
        </p>

        {message && <p className="mb-3 text-sm text-red-400">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-white">New password</label>
            <input
              type="password"
              className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-white">Password again</label>
            <input
              type="password"
              className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 text-sm font-medium rounded-sm bg-[#1e90ff] text-white hover:bg-[#1879d9] disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save changes and sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
