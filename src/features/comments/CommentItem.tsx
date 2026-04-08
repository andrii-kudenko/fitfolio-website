"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [liked, setLiked] = useState(comment.likedByViewer ?? false);
  const [deleting, setDeleting] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  useEffect(() => {
    setLikes(comment.likeCount);
    setLiked(comment.likedByViewer ?? false);
  }, [comment.id, comment.likeCount, comment.likedByViewer]);

  const isOwner = comment.userId === currentUserId;
  const isDeleted = comment.isDeleted;

  const displayLabel = useMemo(() => {
    const handle = comment.username?.trim();
    if (handle && handle.length > 0) {
      return handle.startsWith("@") ? handle : `@${handle}`;
    }
    return isOwner ? "You" : "User";
  }, [comment.username, isOwner]);

  const createdLabel = useMemo(() => timeAgo(comment.createdAt), [comment.createdAt]);

  const avatarSrc = comment.userAvatarUrl?.trim() || "/face.jpg";
  const avatarSize = isReply ? "h-8 w-8" : "h-10 w-10";

  async function handleLikeToggle() {
    if (!currentUserId) {
      alert("Please log in to like comments.");
      return;
    }
    if (isDeleted || likeBusy) return;

    const nextLiked = !liked;
    setLikeBusy(true);
    setLiked(nextLiked);
    setLikes((n) => n + (nextLiked ? 1 : -1));

    try {
      if (nextLiked) {
        await commentsApi.like(comment.id);
      } else {
        await commentsApi.unlike(comment.id);
      }
    } catch (err) {
      console.error("Like toggle failed", err);
      setLiked(!nextLiked);
      setLikes((n) => n + (nextLiked ? -1 : 1));
    } finally {
      setLikeBusy(false);
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
    <div className={`flex gap-3 ${isReply ? "py-1" : "border-b border-slate-800/80 py-4 last:border-b-0"}`}>
      <div
        className={`relative shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-slate-700 ${avatarSize}`}
      >
        <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
          <span className="font-medium text-white">{displayLabel}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{createdLabel}</span>
        </div>

        <div className="mt-1.5 break-words">
          {isDeleted ? (
            <span className="italic text-slate-500">This comment was deleted</span>
          ) : (
            <span className="text-slate-200">{comment.text}</span>
          )}
        </div>

        {!isDeleted && (
          <div className="mt-2.5 flex flex-wrap items-center gap-4 text-sm">
            <button
              type="button"
              onClick={handleLikeToggle}
              disabled={likeBusy}
              title={!currentUserId ? "Log in to like" : liked ? "Unlike" : "Like"}
              className={`transition disabled:opacity-50 ${
                liked
                  ? "font-medium text-ff-cyan"
                  : "text-slate-400 hover:text-ff-cyan"
              }`}
            >
              {liked ? "Liked" : "Like"}
              {likes > 0 ? ` · ${likes}` : ""}
            </button>

            <button
              type="button"
              onClick={() => onReply(comment.id)}
              className="text-slate-400 transition hover:text-ff-cyan"
            >
              Reply
            </button>

            {isOwner && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-red-400/90 transition hover:text-red-300 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
