import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  withCredentials: true,
});

// ==========================
// DASHBOARD
// ==========================

export type AdminStats = {
  users: number;
  items: number;
  comments: number;
  reviews: number;
};

export async function getAdminStats() {
  const res = await api.get<AdminStats>("/admin/stats");
  return res.data;
}

export async function getRecentUsers() {
  const res = await api.get<AdminUser[]>("/admin/recent-users");
  return res.data;
}

export async function getRecentComments() {
  const res = await api.get<AdminComment[]>("/admin/recent-comments");
  return res.data;
}

export async function getRecentReviews() {
  const res = await api.get<AdminReview[]>("/admin/recent-reviews");
  return res.data;
}

// ==========================
// USERS
// ==========================

export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt?: string;
  lastLoginAt?: string | null;
};

export type AdminUsersPage = {
  content: AdminUser[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export async function getAdminUsers(page = 0, size = 20, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const res = await api.get<AdminUsersPage>(`/admin/users?${params.toString()}`);
  return res.data;
}

export async function updateAdminUserRole(userId: string, role: string) {
  await api.put(`/admin/users/${userId}/role?role=${encodeURIComponent(role)}`);
}

export async function updateAdminUserStatus(userId: string, status: string) {
  await api.put(`/admin/users/${userId}/status?status=${encodeURIComponent(status)}`);
}

export async function getAdminMe() {
  const res = await api.get("/admin/me");
  return res.data;
}

// ==========================
// ITEMS
// ==========================

export type AdminItem = {
  id: string;
  name: string;
  brandId?: string;
  status: string;
};

export type AdminItemsPage = {
  content: AdminItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export async function getAdminItems(page = 0, size = 20, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const res = await api.get<AdminItemsPage>(`/admin/items?${params.toString()}`);
  return res.data;
}

export async function updateAdminItemStatus(id: string, status: string) {
  await api.put(`/admin/items/${id}/status?status=${encodeURIComponent(status)}`);
}

// ==========================
// COMMENTS
// ==========================

export type AdminComment = {
  id: string;
  userId: string;
  userDisplayName?: string;
  parentId?: string | null;
  subjectId: string;
  subjectType: string;
  text: string;
  likeCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminCommentsPage = {
  content: AdminComment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export async function getAdminComments(page = 0, size = 20, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const res = await api.get<AdminCommentsPage>(`/admin/comments?${params.toString()}`);
  return res.data;
}

export async function restoreAdminComment(id: string) {
  await api.put(`/admin/comments/${id}/restore`);
}

export async function deleteAdminComment(id: string) {
  await api.delete(`/admin/comments/${id}`);
}

// ==========================
// REVIEWS
// ==========================

export type AdminReview = {
  id: string;
  userId: string;
  itemId: string;
  title?: string;
  text?: string;
  rating?: number;
  likeCount: number;
  isVerified: boolean;
  isDeleted: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminReviewsPage = {
  content: AdminReview[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export async function getAdminReviews(page = 0, size = 20, search = "") {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const res = await api.get<AdminReviewsPage>(`/admin/reviews?${params.toString()}`);
  return res.data;
}

export async function hideAdminReview(id: string) {
  await api.put(`/admin/reviews/${id}/hide`);
}

export async function restoreAdminReview(id: string) {
  await api.put(`/admin/reviews/${id}/restore`);
}

export async function deleteAdminReview(id: string) {
  await api.delete(`/admin/reviews/${id}`);
}