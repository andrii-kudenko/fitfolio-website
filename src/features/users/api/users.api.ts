// src/features/users/api.ts

import { api } from "@/shared/lib/api";
import type {
  UserCreate,
  UserResponse,
  UserProfileCreate,
  UserProfileResponse,
  FitProfileCreate,
  FitProfileResponse,
  UserPage,
  UserWithProfilesPage,
} from "../types/users.types"; // adjust path if needed
import type { PageMeta } from "@/shared/types/pagination";

/** Spring Page may be flat (number, size, totalPages) or wrapped in `page`. */
function normalizePage<T>(raw: UserWithProfilesPage & Record<string, unknown>): UserWithProfilesPage {
  const content = raw.content ?? [];
  if (raw.page && typeof raw.page === "object") {
    return { content, page: raw.page as PageMeta };
  }
  return {
    content,
    page: {
      size: Number(raw.size ?? 20),
      number: Number(raw.number ?? 0),
      totalElements: Number(raw.totalElements ?? content.length),
      totalPages: Number(raw.totalPages ?? 0),
    },
  };
}

export const usersApi = {
  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------

  getAll: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<UserPage> => {
    const { data } = await api.get<UserPage>("/users", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        ...(params?.sort ? { sort: params.sort } : {}),
      },
    });
    return data; // { content, page }
  },

  getAllUsersOnly: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<UserResponse[]> => {
    const { data } = await api.get<UserPage>("/users", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        ...(params?.sort ? { sort: params.sort } : {}),
      },
    });
    return data.content;
  },

  getById: async (id: string): Promise<UserResponse> => {
    const { data } = await api.get<UserResponse>(`/users/${id}`);
    return data;
  },

  getByEmail: async (email: string): Promise<UserResponse> => {
    const { data } = await api.get<UserResponse>(
      `/users/by-email/${encodeURIComponent(email)}`
    );
    return data;
  },

  create: async (payload: UserCreate): Promise<UserResponse> => {
    const { data } = await api.post<UserResponse>("/users", payload);
    return data;
  },

  // ---------------------------------------------------------------------------
  // UserProfile
  // ---------------------------------------------------------------------------

  getProfile: async (userId: string): Promise<UserProfileResponse> => {
    const { data } = await api.get<UserProfileResponse>(
      `/users/${userId}/profile`
    );
    return data;
  },

  getProfileByUsername: async (username: string): Promise<UserProfileResponse> => {
    const normalized = username.toLowerCase();
    const { data } = await api.get<UserProfileResponse>(
      `/users/by-username/${encodeURIComponent(normalized)}/profile`
    );
    return data;
  },

  upsertProfile: async (
    userId: string,
    payload: UserProfileCreate
  ): Promise<UserProfileResponse> => {
    const { data } = await api.put<UserProfileResponse>(
      `/users/${userId}/profile`,
      payload
    );
    return data;
  },

  // ---------------------------------------------------------------------------
  // FitProfile
  // ---------------------------------------------------------------------------

  getFitProfile: async (userId: string): Promise<FitProfileResponse> => {
    const { data } = await api.get<FitProfileResponse>(
      `/users/${userId}/fit-profile`
    );
    return data;
  },

  upsertFitProfile: async (
    userId: string,
    payload: FitProfileCreate
  ): Promise<FitProfileResponse> => {
    const { data } = await api.put<FitProfileResponse>(
      `/users/${userId}/fit-profile`,
      payload
    );
    return data;
  },

  // ---------------------------------------------------------------------------
  // Follow (session cookie)
  // ---------------------------------------------------------------------------

  follow: async (userId: string): Promise<void> => {
    await api.post(`/users/${userId}/follow`);
  },

  unfollow: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}/follow`);
  },

  getFollowStatus: async (userId: string): Promise<{ following: boolean }> => {
    const { data } = await api.get<{ following: boolean }>(
      `/users/${userId}/follow-status`
    );
    return data;
  },

  getFollowers: async (
    userId: string,
    params?: { page?: number; size?: number }
  ): Promise<UserWithProfilesPage> => {
    const { data } = await api.get<UserWithProfilesPage & Record<string, unknown>>(
      `/users/${userId}/followers`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
        },
      }
    );
    return normalizePage(data);
  },

  getFollowing: async (
    userId: string,
    params?: { page?: number; size?: number }
  ): Promise<UserWithProfilesPage> => {
    const { data } = await api.get<UserWithProfilesPage & Record<string, unknown>>(
      `/users/${userId}/following`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
        },
      }
    );
    return normalizePage(data);
  },
};
