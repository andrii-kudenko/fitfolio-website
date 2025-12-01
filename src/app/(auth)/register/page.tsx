"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getStoredUsers() {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("fitfolio_users");
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveStoredUsers(users: any[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("fitfolio_users", JSON.stringify(users));
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const emailFromQuery = searchParams.get("email") || "";
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!email.trim() || !name.trim() || !password.trim() || !password2.trim()) {
      setMessage("Please fill in all fields.");
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

    const users = getStoredUsers();
    const existing = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      setMessage("An account with this email already exists. Please sign in.");
      return;
    }

    users.push({ email, name, password }); // NOTE: plain text for demo only
    saveStoredUsers(users);

    // Goes back to login after account creation
    router.push("/login");
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="min-h-screen flex flex-col items-center">
      <div className="mt-6 mb-4 text-2xl font-semibold text-white">
        Fi<span className="text-blue-400">Folio</span>
      </div>

      <div className="w-full max-w-md bg-[#040707] border border-gray-700 rounded-md p-6">
        <h1 className="text-2xl font-semibold mb-4 text-white">
          Create account
        </h1>

        {message && (
          <p className="mb-3 text-sm text-red-400">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-white">
              Email
            </label>
            <input
              type="email"
              className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-white">
              Your name
            </label>
            <input
              className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First and last name"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-white">
              Password (at least 6 characters)
            </label>
            <input
              type="password"
              className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-white">
              Password again
            </label>
            <input
              type="password"
              className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2 text-sm font-medium border border-yellow-500 rounded-sm bg-yellow-400 text-black hover:bg-yellow-300"
          >
            Create account
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-400">
          By creating an account, you agree to FitFolio&apos;s Terms of Use and Privacy Notice.
        </p>

        <p className="mt-4 text-sm text-gray-300">
          Already a customer?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-blue-400 underline"
          >
            Sign in instead
          </button>
        </p>
        </div>
      </div>
    </Suspense>
  );
}
