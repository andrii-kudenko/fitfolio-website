"use client";

import { useMemo, useState } from "react";
import { commentsApi } from "./api/comments.api";
import type { CommentResponse } from "./types/comments.types";

function timeAgo(isoDate: string) {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));

  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function CommentItem({
  comment,
  currentUserId,
  onDelete,
  onReply,
  isReply = false,
}: {
  comment: CommentResponse;
  currentUserId: string;
  onDelete: (commentId: string) => void;
  onReply: (commentId: string) => void;
  isReply?: boolean;
}) {
  const [likes, setLikes] = useState(comment.likeCount);
  const [liked, setLiked] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = comment.userId === currentUserId;
  const isDeleted = comment.isDeleted;

  const displayName = useMemo(() => {
    if (comment.userDisplayName && comment.userDisplayName.trim().length > 0) {
      return comment.userDisplayName;
    }
    return isOwner ? "You" : "User";
  }, [comment.userDisplayName, isOwner]);

  const createdLabel = useMemo(() => timeAgo(comment.createdAt), [comment.createdAt]);

  async function handleLike() {
    if (liked || isDeleted) return;

    try {
      await commentsApi.like(comment.id);
      setLikes((prev) => prev + 1);
      setLiked(true);
    } catch (err) {
      console.error("Like failed", err);
    }
  }

  async function handleDelete() {
    if (deleting) return;

    setDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className={
        isReply
          ? "rounded-lg px-3 py-2"
          : "bg-white/5 border border-white/10 rounded-lg p-4"
      }
    >
      <div className="flex items-center gap-2 text-sm text-white/60">
        <span className="text-white/90 font-medium">{displayName}</span>
        <span>•</span>
        <span>{createdLabel}</span>
      </div>

      <div className="mt-2 break-words">
        {isDeleted ? (
          <span className="italic text-white/40">This comment was deleted</span>
        ) : (
          <span className="text-white/80">{comment.text}</span>
        )}
      </div>

      {!isDeleted && (
        <div className="flex items-center gap-5 text-sm text-white/50 mt-3">
          <button
            onClick={handleLike}
            disabled={liked}
            className={`transition ${
              liked ? "text-blue-400 cursor-not-allowed" : "hover:text-white"
            }`}
          >
            👍 {likes}
          </button>

          <button
            onClick={() => onReply(comment.id)}
            className="hover:text-white transition"
          >
            Reply
          </button>

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-400 hover:text-red-300 disabled:opacity-50 transition"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}