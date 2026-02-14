"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  // Load the email that was just used to register (display only)
  useEffect(() => {
    const saved = localStorage.getItem("fitfolio_register_email");
    if (saved) {
      setEmail(saved);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder – verification not implemented yet
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Logo */}
      <div className="mt-10 mb-6 text-3xl font-semibold text-white">
        <span className="text-blue-400">FitFolio</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-xl bg-[#040707] border border-gray-700 rounded-md p-8">
        <h1 className="text-2xl font-semibold mb-4 text-white">
          Verify email address
        </h1>

        <p className="text-sm text-gray-300 mb-4">
          To verify your email, we&apos;ve sent a One Time Password (OTP) to{" "}
          <span className="font-mono text-gray-100">
            {email || "your email"}
          </span>
          .
          <button
            type="button"
            disabled
            className="ml-1 text-xs text-blue-400 opacity-60 cursor-not-allowed"
          >
            Change
          </button>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-white">
              Enter security code
            </label>
            <input
              type="text"
              className="border border-gray-600 rounded-sm px-3 py-2 text-sm bg-black text-white"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
            />
          </div>

          <button
            type="submit"
            disabled
            className="w-full mt-3 py-2 text-sm font-medium rounded-sm bg-blue-500 text-white opacity-60 cursor-not-allowed"
          >
            Create your FitFolio account
          </button>
        </form>

        <button
          type="button"
          disabled
          className="mt-4 text-sm text-blue-400 opacity-50 cursor-not-allowed"
        >
          Resend code
        </button>
      </div>
    </div>
  );
}
