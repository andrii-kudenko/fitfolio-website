"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetCodePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("fitfolio_reset_email");
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

      {/* Main content */}
      <div className="w-full max-w-md bg-[#040707] border border-gray-700 rounded-md p-6">
        <h1 className="text-2xl font-semibold text-white mb-4">
          Enter verification code
        </h1>

        <p className="text-sm text-gray-400 mb-1">
          For your security, we&apos;ve sent the code to your email{" "}
          <span className="text-gray-200">
            {email || "your email"}
          </span>
        </p>

        <p className="text-xs text-gray-500 mb-4">
          Enter the code below to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-white">
              Security code
            </label>
            <input
              className="w-full rounded-md border border-gray-600 bg-black px-3 py-2 text-sm text-white"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
            />
          </div>

          <button
            type="submit"
            disabled
            className="w-full mt-2 rounded-md bg-blue-500 py-2 text-sm font-medium text-white opacity-60 cursor-not-allowed"
          >
            Submit code
          </button>
        </form>

        <button
          type="button"
          disabled
          className="mt-4 text-xs text-blue-400 opacity-50 cursor-not-allowed"
        >
          Resend code
        </button>
      </div>
    </div>
  );
}
