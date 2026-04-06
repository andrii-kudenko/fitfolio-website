"use client";

import { useEffect, useMemo, useState } from "react";
import { commentsApi } from "./api/comments.api";
import { api } from "@/shared/lib/api";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import type {
  CommentResponse,
  CommentSubjectType,
} from "./types/comments.types";

type CommentNode = CommentResponse & {
  children: CommentNode[];
};

function buildCommentTree(comments: CommentResponse[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const comment of comments) {
    map.set(comment.id, { ...comment, children: [] });
  }

  for (const comment of comments) {
    const node = map.get(comment.id)!;

    if (comment.parentId && map.has(comment.parentId)) {
      map.get(comment.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function sortTreeNewest(nodes: CommentNode[]): CommentNode[] {
  return [...nodes]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .map((node) => ({
      ...node,
      children: sortTreeNewest(node.children),
    }));
}

type ThreadProps = {
  comment: CommentNode;
  currentUserId: string;
  replyToId: string | null;
  setReplyToId: (id: string | null) => void;
  onDelete: (commentId: string) => Promise<void>;
  onReplySubmit: (parentCommentId: string, text: string) => Promise<void>;
  collapsedIds: Set<string>;
  onToggleCollapse: (commentId: string) => void;
  depth?: number;
};

function CommentThread({
  comment,
  currentUserId,
  replyToId,
  setReplyToId,
  onDelete,
  onReplySubmit,
  collapsedIds,
  onToggleCollapse,
  depth = 0,
}: ThreadProps) {
  const isCollapsed = collapsedIds.has(comment.id);
  const hasChildren = comment.children.length > 0;
  const visualDepth = Math.min(depth, 4);

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="w-5 flex justify-center pt-3">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggleCollapse(comment.id)}
              className="h-5 w-5 rounded-full border border-white/25 text-xs text-white/70 hover:text-white hover:border-white/50 transition"
              title={isCollapsed ? "Expand replies" : "Collapse replies"}
            >
              {isCollapsed ? "+" : "−"}
            </button>
          ) : (
            <div className="h-5 w-5 rounded-full border border-white/10" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <CommentItem
            comment={comment}
            currentUserId={currentUserId}
            onDelete={onDelete}
            onReply={setReplyToId}
            isReply={depth > 0}
          />

          {replyToId === comment.id && (
            <div
              className={`mt-3 ${
                visualDepth > 0 ? "ml-4 border-l border-white/10 pl-4" : ""
              }`}
            >
              <CommentForm
                onSubmit={(text) => onReplySubmit(comment.id, text)}
                onCancel={() => setReplyToId(null)}
                compact
                placeholder="Write a reply..."
              />
            </div>
          )}

          {!isCollapsed && hasChildren && (
            <div
              className={`mt-3 space-y-4 border-l border-white/10 pl-4 ${
                visualDepth >= 4 ? "ml-4" : "ml-6"
              }`}
            >
              {comment.children.map((child) => (
                <CommentThread
                  key={child.id}
                  comment={child}
                  currentUserId={currentUserId}
                  replyToId={replyToId}
                  setReplyToId={setReplyToId}
                  onDelete={onDelete}
                  onReplySubmit={onReplySubmit}
                  collapsedIds={collapsedIds}
                  onToggleCollapse={onToggleCollapse}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentsSection({
  subjectType,
  subjectId,
}: {
  subjectType: CommentSubjectType;
  subjectId: string;
}) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [me, setMe] = useState<{ id: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        setMe(data);
      } catch {
        setMe(null);
      }
    })();
  }, []);

  async function loadComments() {
    setLoading(true);
    try {
      const data = await commentsApi.listForSubject(subjectType, subjectId, {
        sort: "newest",
      });
      setComments(data.content || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (subjectId) {
      loadComments();
    }
  }, [subjectType, subjectId]);

  async function handleCreate(text: string) {
    if (!me) {
      alert("Please log in to comment.");
      return;
    }

    if (posting) return;
    setPosting(true);

    try {
      if (subjectType === "ITEM") {
        await commentsApi.createForItem(subjectId, { parentId: null, text });
      } else {
        await commentsApi.createForSubject({
          parentId: null,
          subjectId,
          subjectType,
          text,
        });
      }
      await loadComments();
    } finally {
      setPosting(false);
    }
  }

  async function handleReplySubmit(parentCommentId: string, text: string) {
    if (!me) {
      alert("Please log in to reply.");
      return;
    }

    if (posting) return;
    setPosting(true);

    try {
      await commentsApi.reply(parentCommentId, { text });
      setReplyToId(null);
      await loadComments();
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(commentId: string) {
    await commentsApi.delete(commentId);
    await loadComments();
  }

  function toggleCollapse(commentId: string) {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  }

  const commentTree = useMemo(() => {
    const tree = buildCommentTree(comments);
    return sortTreeNewest(tree);
  }, [comments]);

  return (
    <div className="space-y-6">
      <CommentForm onSubmit={handleCreate} placeholder="Write a comment..." />

      {loading ? (
        <div className="text-white/60">Loading comments...</div>
      ) : commentTree.length === 0 ? (
        <div className="text-white/60">No comments yet.</div>
      ) : (
        <div className="space-y-6">
          {commentTree.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              currentUserId={me?.id ?? ""}
              replyToId={replyToId}
              setReplyToId={setReplyToId}
              onDelete={handleDelete}
              onReplySubmit={handleReplySubmit}
              collapsedIds={collapsedIds}
              onToggleCollapse={toggleCollapse}
            />
          ))}
        </div>
      )}
    </div>
  );
}