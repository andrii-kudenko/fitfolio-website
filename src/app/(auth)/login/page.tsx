"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "password" | "new">("email");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // User enters email
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (email.trim() === "") {
      setMessage("Please enter your email.");
      return;
    }

    try {
      setLoadingEmail(true);

      const res = await fetch(
        `http://localhost:8080/api/auth/email-exists?email=${encodeURIComponent(email)}`
      );

      // If backend works and sends true/false as JSON
      if (res.ok) {
        const exists: boolean = await res.json();

        if (exists) {
          setStep("password"); // If email exists, ask for password
        } else {
          setStep("new"); // If email does not exist, show "new user" screen
        }

        return;
      }

      // If backend returns any error, treat as "new user"
      setStep("new");
    } catch (err) {
      // If request itself fails, also treat as new user
      setStep("new");
    } finally {
      setLoadingEmail(false);
    }
  }

  // Existing user enters password, real login happens here
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (password.trim() === "") {
      setMessage("Please enter your password.");
      return;
    }

    try {
      setLoadingPassword(true);

      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setMessage("Incorrect password. Please try again.");
        return;
      }

      const user = await res.json();

      // Temporary login for now (store user)
      if (typeof window !== "undefined") {
        localStorage.setItem("fitfolio_logged_in", JSON.stringify(user));
      }

      router.push("/");
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoadingPassword(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* top logo */}
      <div className="mt-10 mb-6 text-3xl font-semibold text-white">
        <span className="text-blue-400">FitFolio</span>
      </div>

      {/* box form */}
      <div className="w-full max-w-md bg-[#040707] border border-gray-700 rounded-md p-6">
        <h1 className={`text-2xl font-semibold text-white ${step === "new" ? "mb-2" : "mb-4"}`}>
          {step === "email" && "Sign in or create account"}
          {step === "password" && "Sign in"}
          {step === "new" && "Looks like you're new to FitFolio"}
        </h1>

        {message && (
          <p className="mb-3 text-sm text-red-400">
            {message}
          </p>
        )}

        {/* email form */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-bold text-white">Enter your email</label>
                <input
                  type="email"
                  className="border border-gray-500 rounded-sm px-2 py-1 text-sm bg-black text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loadingEmail}
                className="w-full mt-2 py-2 text-sm font-medium rounded-sm bg-[#1e90ff] text-white hover:bg-[#1879d9] disabled:opacity-60"
              >
                {loadingEmail ? "Checking..." : "Continue"}
              </button>
            </form>
          )}

        {/* If account exists, ask for password */}
        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* email line + Change */}
            <div className="text-sm text-gray-300">
              <span className="mr-2">{email}</span>
              <button
                type="button"
                onClick={() => {
                  // go back to email step so they can edit
                  setStep("email");
                  setPassword("");
                  setMessage("");
                }}
                className="text-xs text-blue-400 hover:underline"
              >
                Change
              </button>
            </div>

            {/* password label + forgot link */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white">Password</label>

                <button
                  type="button"
                  onClick={() => router.push("/reset")}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

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
              disabled={loadingPassword}
              className="w-full mt-2 py-2 text-sm font-medium rounded-sm bg-[#1e90ff] text-white hover:bg-[#1879d9] disabled:opacity-60"
            >
              {loadingPassword ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {/* If new user, goes to account creation */}
        {step === "new" && (
          <div className="mt-2 space-y-4 text-sm text-white">

            {/* Email + Change button */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-300">{email}</span>

                <button
                  type="button"
                  className="text-blue-400 hover:underline text-xs"
                  onClick={() => {
                    setStep("email");
                    setMessage("");
                  }}
                >
                  Change
                </button>
              </div>

            {/* Description */}
            <p className="text-xs text-gray-400">
              Let's create an account using your email
            </p>

            {/* Create account button */}
            <Link
              href={`/register?email=${encodeURIComponent(email)}`}
              className="block w-full text-center mt-2 py-2 text-sm font-medium rounded-md bg-[#1d8efa] text-white hover:bg-[#0f7ae6]"
            >
              Proceed to create an account
            </Link>

            <div className="pt-2 text-xs text-gray-400">
              Already a user?{" "}
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setPassword("");
                  setMessage("");
                }}
                className="text-blue-400 hover:underline"
              >
                Sign in with another email or mobile
              </button>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">
          By continuing, you agree to FitFolio&apos;s Terms of Use and Privacy Notice.
        </p>
      </div>
    </div>
  );
}
