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
} from "../types/users.types"; // adjust path if needed

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
};
