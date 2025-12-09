"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // pre-fill email from /register?email=...
  useEffect(() => {
    const emailFromQuery = searchParams.get("email") || "";
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (
      !email.trim() ||
      !firstName.trim() ||
      !lastName.trim() ||
      !password.trim() ||
      !password2.trim()
    ) {
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

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        setMessage(text || "Account creation failed. Please try again.");
        return;
      }

      // After account creation, redirect to login page
      router.push("/login");
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* logo */}
      <div className="mt-6 mb-4 text-2xl font-semibold text-white">
        <span className="text-blue-400">FitFolio</span>
      </div>

      {/* form box */}
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
            <label className="text-sm font-bold text-white">Enter email</label>
            <input
              type="email"
              className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-white">First name</label>
            <input
              className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-white">Last name</label>
            <input
              className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
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
            disabled={loading}
            className="w-full mt-2 py-2 text-sm font-medium rounded-sm bg-[#1e90ff] text-white hover:bg-[#1879d9] disabled:opacity-60"
          >
            {loading ? "Verifying Email..." : "Verify Email"}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-400">
          By creating an account, you agree to FitFolio&apos;s Terms of Use and
          Privacy Notice.
        </p>

        <div className="mt-2 text-xs text-gray-400">
          Already a user?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-blue-400 hover:underline"
          >
            Sign in instead
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
