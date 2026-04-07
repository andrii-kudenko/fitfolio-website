"use client";

import { useEffect, useState } from "react";
import {
  getAdminItems,
  updateAdminItemStatus,
  type AdminItem,
} from "@/features/admin/api/api";

export default function AdminItemsPage() {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  async function loadItems(currentPage = page, currentSearch = search) {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminItems(currentPage, size, currentSearch);
      setItems(data.content || []);
      setTotalPages(data.totalPages ?? 1);
      setPage(data.number ?? 0);
    } catch (err) {
      setError("Failed to load items.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems(page, search);
  }, [page, search]);

  async function handleStatusChange(itemId: string, status: string) {
    try {
      setSavingId(itemId);
      setMessage("");
      await updateAdminItemStatus(itemId, status);
      await loadItems(page, search);
      setMessage("Item status updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update item status.");
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
      <h1 className="text-4xl font-bold mb-8">Admin Items</h1>

      <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search items by name..."
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

      {loading && <p>Loading items...</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {message && <p className="text-green-400 mb-4">{message}</p>}
      {savingId && <p className="text-cyan-400 mb-4">Saving changes...</p>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto rounded-xl border border-cyan-900">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#031014]">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Brand ID</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isSavingThisRow = savingId === item.id;

                  return (
                    <tr key={item.id} className="border-t border-cyan-950">
                      <td className="p-4">{item.name}</td>
                      <td className="p-4">{item.brandId || "-"}</td>
                      <td className="p-4">
                        <select
                          className="bg-black border border-cyan-800 rounded px-3 py-2 disabled:opacity-50"
                          value={item.status}
                          disabled={isSavingThisRow}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        >
                          <option value="draft">draft</option>
                          <option value="published">published</option>
                          <option value="archived">archived</option>
                        </select>
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