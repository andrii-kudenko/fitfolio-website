"use client";

import { useEffect, useState } from "react";
import {
  getAdminComments,
  restoreAdminComment,
  deleteAdminComment,
  type AdminComment,
} from "@/features/admin/api/api";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  async function loadComments(currentPage = page, currentSearch = search) {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminComments(currentPage, size, currentSearch);
      setComments(data.content || []);
      setTotalPages(data.totalPages ?? 1);
      setPage(data.number ?? 0);
    } catch (err) {
      setError("Failed to load comments.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments(page, search);
  }, [page, search]);

  async function handleDelete(commentId: string) {
    try {
      setSavingId(commentId);
      setMessage("");
      await deleteAdminComment(commentId);
      await loadComments(page, search);
      setMessage("Comment deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleRestore(commentId: string) {
    try {
      setSavingId(commentId);
      setMessage("");
      await restoreAdminComment(commentId);
      await loadComments(page, search);
      setMessage("Comment restored successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to restore comment.");
    } finally {
      setSavingId(null);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(0);
  }

  const hasPrevious = page > 0;
  const hasNext = page + 1 < totalPages;

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Admin Comments</h1>

      <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search comments by text..."
          className="bg-black border border-cyan-800 rounded px-4 py-2 w-full max-w-md"
        />
        <button
          type="submit"
          className="border border-cyan-800 rounded px-4 py-2 hover:bg-cyan-950"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleClearSearch}
          className="border border-cyan-800 rounded px-4 py-2 hover:bg-cyan-950"
        >
          Clear
        </button>
      </form>

      {loading && <p>Loading comments...</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {message && <p className="text-green-400 mb-4">{message}</p>}
      {savingId && <p className="text-cyan-400 mb-4">Saving changes...</p>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto rounded-xl border border-cyan-900">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#031014]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Text</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Deleted</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment) => {
                  const isSavingThisRow = savingId === comment.id;

                  return (
                    <tr key={comment.id} className="border-t border-cyan-950">
                      <td className="p-4">
                        {comment.userDisplayName || comment.userId}
                      </td>
                      <td className="p-4 max-w-md truncate">{comment.text}</td>
                      <td className="p-4">
                        {comment.subjectType} <br />
                        <span className="text-xs text-cyan-400">{comment.subjectId}</span>
                      </td>
                      <td className="p-4">
                        {comment.isDeleted ? "Yes" : "No"}
                      </td>
                      <td className="p-4">
                        {comment.isDeleted ? (
                          <button
                            onClick={() => handleRestore(comment.id)}
                            disabled={isSavingThisRow}
                            className="border border-cyan-800 rounded px-3 py-2 disabled:opacity-50 hover:bg-cyan-950"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(comment.id)}
                            disabled={isSavingThisRow}
                            className="border border-red-700 rounded px-3 py-2 disabled:opacity-50 hover:bg-red-950"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => hasPrevious && setPage((prev) => prev - 1)}
              disabled={!hasPrevious}
              className="border border-cyan-800 rounded px-4 py-2 disabled:opacity-50 hover:bg-cyan-950"
            >
              Previous
            </button>

            <p className="text-sm text-cyan-300">
              Page {page + 1} of {totalPages}
            </p>

            <button
              onClick={() => hasNext && setPage((prev) => prev + 1)}
              disabled={!hasNext}
              className="border border-cyan-800 rounded px-4 py-2 disabled:opacity-50 hover:bg-cyan-950"
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}