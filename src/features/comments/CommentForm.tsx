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
          className="flex-1 border-b border-slate-700 bg-transparent py-2 text-white placeholder:text-slate-500 outline-none focus:border-ff-cyan/60"
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
          className="rounded-full bg-ff-cyan px-4 py-1.5 text-sm font-medium text-black transition hover:bg-ff-cyan/90 disabled:opacity-50"
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
        className="min-h-[120px] w-full resize-none rounded-xl border border-slate-700 bg-black/40 p-4 text-white placeholder:text-slate-500 outline-none focus:border-ff-cyan/50"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="rounded-full bg-ff-cyan px-6 py-3 text-sm font-medium text-black transition hover:bg-ff-cyan/90 disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </form>
  );
}