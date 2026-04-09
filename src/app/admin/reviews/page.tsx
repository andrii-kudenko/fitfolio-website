"use client";

import { useEffect, useState } from "react";
import {
  getAdminReviews,
  hideAdminReview,
  restoreAdminReview,
  deleteAdminReview,
  type AdminReview,
} from "@/features/admin/api/api";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  async function loadReviews(currentPage = page, currentSearch = search) {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminReviews(currentPage, size, currentSearch);
      setReviews(data.content || []);
      setTotalPages(data.totalPages ?? 1);
      setPage(data.number ?? 0);
    } catch (err) {
      setError("Failed to load reviews.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews(page, search);
  }, [page, search]);

  async function handleHide(reviewId: string) {
    try {
      setSavingId(reviewId);
      setMessage("");
      await hideAdminReview(reviewId);
      await loadReviews(page, search);
      setMessage("Review hidden successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to hide review.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleRestore(reviewId: string) {
    try {
      setSavingId(reviewId);
      setMessage("");
      await restoreAdminReview(reviewId);
      await loadReviews(page, search);
      setMessage("Review restored successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to restore review.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(reviewId: string) {
    const confirmed = window.confirm("Are you sure you want to delete this review?");
    if (!confirmed) return;

    try {
      setSavingId(reviewId);
      setMessage("");
      await deleteAdminReview(reviewId);
      await loadReviews(page, search);
      setMessage("Review deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete review.");
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

  function getStatusClasses(status?: string) {
    const normalized = (status || "").toUpperCase();

    if (normalized === "ACTIVE") {
      return "bg-green-950 text-green-300 border border-green-800";
    }

    if (normalized === "HIDDEN") {
      return "bg-yellow-950 text-yellow-300 border border-yellow-800";
    }

    return "bg-gray-900 text-gray-300 border border-gray-700";
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Admin Reviews</h1>

      <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search reviews by title or text..."
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

      {loading && <p>Loading reviews...</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {message && <p className="text-green-400 mb-4">{message}</p>}
      {savingId && <p className="text-cyan-400 mb-4">Saving changes...</p>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto rounded-xl border border-cyan-900">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#031014]">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Text</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Deleted</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => {
                  const isSavingThisRow = savingId === review.id;

                  return (
                    <tr key={review.id} className="border-t border-cyan-950">
                      <td className="p-4 align-top max-w-[220px]">
                        <div className="font-medium break-words">
                          {review.title || "-"}
                        </div>
                      </td>

                      <td className="p-4 align-top max-w-[420px]">
                        <div
                          className="text-white/90 overflow-hidden text-ellipsis"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                          }}
                          title={review.text || "-"}
                        >
                          {review.text || "-"}
                        </div>
                      </td>

                      <td className="p-4 align-top">{review.rating ?? "-"}</td>

                      <td className="p-4 align-top">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusClasses(
                            review.status
                          )}`}
                        >
                          {review.status || "-"}
                        </span>
                      </td>

                      <td className="p-4 align-top">
                        {review.isDeleted ? "Yes" : "No"}
                      </td>

                      <td className="p-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {!review.isDeleted && review.status !== "hidden" && review.status !== "HIDDEN" && (
                            <button
                              onClick={() => handleHide(review.id)}
                              disabled={isSavingThisRow}
                              className="border border-yellow-700 rounded px-3 py-2 disabled:opacity-50 hover:bg-yellow-950"
                            >
                              Hide
                            </button>
                          )}

                          {(review.isDeleted || review.status === "hidden" || review.status === "HIDDEN") && (
                            <button
                              onClick={() => handleRestore(review.id)}
                              disabled={isSavingThisRow}
                              className="border border-cyan-800 rounded px-3 py-2 disabled:opacity-50 hover:bg-cyan-950"
                            >
                              Restore
                            </button>
                          )}

                          {!review.isDeleted && (
                            <button
                              onClick={() => handleDelete(review.id)}
                              disabled={isSavingThisRow}
                              className="border border-red-700 rounded px-3 py-2 disabled:opacity-50 hover:bg-red-950"
                            >
                              Delete
                            </button>
                          )}
                        </div>
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