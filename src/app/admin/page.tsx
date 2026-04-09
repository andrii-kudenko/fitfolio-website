"use client";

import { useEffect, useState } from "react";
import {
  getAdminStats,
  getRecentUsers,
  getRecentComments,
  getRecentReviews,
  type AdminStats,
  type AdminUser,
  type AdminComment,
  type AdminReview,
} from "@/features/admin/api/api";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [recentComments, setRecentComments] = useState<AdminComment[]>([]);
  const [recentReviews, setRecentReviews] = useState<AdminReview[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [statsData, usersData, commentsData, reviewsData] = await Promise.all([
          getAdminStats(),
          getRecentUsers(),
          getRecentComments(),
          getRecentReviews(),
        ]);

        setStats(statsData);
        setRecentUsers(usersData || []);
        setRecentComments(commentsData || []);
        setRecentReviews(reviewsData || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <p className="text-sm text-gray-300">
          Overview of platform activity.
        </p>
      </div>

      {loading && <p className="text-gray-300">Loading dashboard...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="border border-cyan-900 rounded-xl bg-[#031014] p-6">
              <p className="text-sm text-cyan-300 mb-2">Total Users</p>
              <p className="text-4xl font-bold text-white">{stats.users}</p>
            </div>

            <div className="border border-cyan-900 rounded-xl bg-[#031014] p-6">
              <p className="text-sm text-cyan-300 mb-2">Total Items</p>
              <p className="text-4xl font-bold text-white">{stats.items}</p>
            </div>

            <div className="border border-cyan-900 rounded-xl bg-[#031014] p-6">
              <p className="text-sm text-cyan-300 mb-2">Total Comments</p>
              <p className="text-4xl font-bold text-white">{stats.comments}</p>
            </div>

            <div className="border border-cyan-900 rounded-xl bg-[#031014] p-6">
              <p className="text-sm text-cyan-300 mb-2">Total Reviews</p>
              <p className="text-4xl font-bold text-white">{stats.reviews}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="border border-gray-700 rounded-md bg-[#040707] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
              <div className="space-y-3">
                {recentUsers.length === 0 ? (
                  <p className="text-sm text-gray-300">No recent users found.</p>
                ) : (
                  recentUsers.map((user) => (
                    <div key={user.id} className="border-b border-gray-800 pb-3 last:border-b-0">
                      <p className="text-white font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border border-gray-700 rounded-md bg-[#040707] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Comments</h3>
              <div className="space-y-3">
                {recentComments.length === 0 ? (
                  <p className="text-sm text-gray-300">No recent comments found.</p>
                ) : (
                  recentComments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-800 pb-3 last:border-b-0">
                      <p className="text-sm text-cyan-400">
                        {comment.userDisplayName || comment.userId}
                      </p>
                      <p
                        className="text-sm text-white overflow-hidden text-ellipsis"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                        title={comment.text}
                      >
                        {comment.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border border-gray-700 rounded-md bg-[#040707] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Reviews</h3>
              <div className="space-y-3">
                {recentReviews.length === 0 ? (
                  <p className="text-sm text-gray-300">No recent reviews found.</p>
                ) : (
                  recentReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-800 pb-3 last:border-b-0">
                      <p className="text-white font-medium">{review.title || "Untitled Review"}</p>
                      <p
                        className="text-sm text-gray-300 overflow-hidden text-ellipsis"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                        title={review.text || ""}
                      >
                        {review.text || "-"}
                      </p>
                      <p className="text-xs text-cyan-400 mt-1">
                        Rating: {review.rating ?? "-"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}