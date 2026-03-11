"use client";

import { useState } from "react";

export default function CommentForm({
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  compact = false,
}: {
  onSubmit: (text: string) => Promise<void> | void;
  onCancel?: () => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const value = text.trim();
    if (!value || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(value);
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-b border-white/20 text-white placeholder:text-white/40 outline-none py-2"
        />
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-white/60 hover:text-white transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="px-4 py-1.5 rounded-full bg-blue-500 text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[120px] rounded-xl border border-white/10 bg-transparent p-4 text-white placeholder:text-white/40 outline-none resize-none"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="px-6 py-3 rounded-xl bg-blue-500 text-white disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </form>
  );
}