"use client";

import { useEffect, useState } from "react";
import {
  getAdminMe,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminUser,
} from "@/features/admin/api/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  async function loadUsers(currentPage = page, currentSearch = search) {
    try {
      setLoading(true);
      setError("");

      const [usersData, meData] = await Promise.all([
        getAdminUsers(currentPage, size, currentSearch),
        getAdminMe(),
      ]);

      setUsers(usersData.content || []);
      setCurrentUser(meData);
      setTotalPages(usersData.totalPages ?? 1);
      setPage(usersData.number ?? 0);
    } catch (err) {
      setError("Failed to load users.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(page, search);
  }, [page, search]);

  async function handleRoleChange(userId: string, role: string) {
    try {
      setSavingId(userId);
      setMessage("");
      await updateAdminUserRole(userId, role);
      await loadUsers(page, search);
      setMessage("Role updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update role.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleStatusChange(userId: string, status: string) {
    try {
      setSavingId(userId);
      setMessage("");
      await updateAdminUserStatus(userId, status);
      await loadUsers(page, search);
      setMessage("Status updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
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
      <h1 className="text-4xl font-bold mb-8">Admin Users</h1>

      <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search users by name or email..."
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

      {loading && <p>Loading users...</p>}
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
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isCurrentAdmin = user.id === currentUser?.id;
                  const isSavingThisRow = savingId === user.id;

                  return (
                    <tr key={user.id} className="border-t border-cyan-950">
                      <td className="p-4">
                        {user.firstName} {user.lastName}
                        {isCurrentAdmin && (
                          <span className="ml-2 text-sm text-cyan-400">(You)</span>
                        )}
                      </td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <select
                          className="bg-black border border-cyan-800 rounded px-3 py-2 disabled:opacity-50"
                          value={user.role}
                          disabled={isSavingThisRow || isCurrentAdmin}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          <option value="USER">USER</option>
                          <option value="INFLUENCER">INFLUENCER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <select
                          className="bg-black border border-cyan-800 rounded px-3 py-2 disabled:opacity-50"
                          value={user.status}
                          disabled={isSavingThisRow || isCurrentAdmin}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        >
                          <option value="active">active</option>
                          <option value="disabled">disabled</option>
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