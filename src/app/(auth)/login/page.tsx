"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "password" | "new">("email");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (email.trim() === "") {
      setMessage("Please enter your email.");
      return;
    }

    const users = getStoredUsers();
    const user = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (user) {
      // if accounts exists, ask for password
      setStep("password");
    } else {
      // if no account is found, state new
      setStep("new");
    }
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (password.trim() === "") {
      setMessage("Please enter your password.");
      return;
    }

    const users = getStoredUsers();
    const user = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      setMessage("No account found for this email. Please create an account.");
      setStep("new");
      return;
    }

    if (user.password !== password) {
      setMessage("Incorrect password. Please try again.");
      return;
    }

    // temporary login for now
    localStorage.setItem("fitfolio_logged_in", JSON.stringify(user));
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* logo */}
      <div className="mt-6 mb-4 text-2xl font-semibold text-white">
        Fi<span className="text-blue-400">Folio</span>
      </div>

      {/* box form */}
      <div className="w-full max-w-md bg-[#040707] border border-gray-700 rounded-md p-6">
        <h1 className="text-2xl font-semibold mb-4 text-white">
          {step === "email" && "Sign in"}
          {step === "password" && "Welcome back"}
          {step === "new" && "Looks like you're new to FitFolio"}
        </h1>

        {message && (
          <p className="mb-3 text-sm text-red-400">
            {message}
          </p>
        )}

        {/* email form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-white">Email</label>
            <input
              type="email"
              className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {step === "email" && (
            <button
              type="submit"
              className="w-full mt-2 py-2 text-sm font-medium border border-yellow-500 rounded-sm bg-yellow-400 text-black hover:bg-yellow-300"
            >
              Continue
            </button>
          )}
        </form>

        {/* If account exists, ask for password */}
        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-white">Password</label>
              <input
                type="password"
                className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2 text-sm font-medium border border-yellow-500 rounded-sm bg-yellow-400 text-black hover:bg-yellow-300"
            >
              Sign in
            </button>
          </form>
        )}

        {/* If new user, goes to account creation */}
        {step === "new" && (
          <div className="mt-2 space-y-3 text-sm text-white">
            <p>
              Looks like you&apos;re new to <span className="font-semibold">FitFolio</span>.
            </p>
            <p className="text-xs text-gray-400">
              We couldn&apos;t find an account with{" "}
              <span className="font-mono">{email}</span>.
            </p>
            <Link
              href={`/register?email=${encodeURIComponent(email)}`}
              className="block w-full text-center mt-2 py-2 text-sm font-medium border border-yellow-500 rounded-sm bg-yellow-400 text-black hover:bg-yellow-300"
            >
              Proceed to create an account
            </Link>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">
          By continuing, you agree to FitFolio&apos;s Terms of Use and Privacy Notice.
        </p>
      </div>

      {/* bottom section */}
      <div className="w-full max-w-md mt-4 flex items-center gap-3 px-6 text-white">
        <div className="flex-1 h-px bg-gray-700" />
        <span className="text-xs text-gray-400 whitespace-nowrap">
          New to FitFolio?
        </span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>

      <div className="w-full max-w-md px-6 mt-3">
        <Link
          href="/register"
          className="block w-full text-center py-2 text-sm font-medium border border-gray-500 rounded-sm bg-[#182131] text-white hover:bg-[#222c3d]"
        >
          Create your FitFolio account
        </Link>
      </div>
    </div>
  );
}
