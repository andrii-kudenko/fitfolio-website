import { api } from "@/shared/lib/api";
import type {
  BrandCreate,
  BrandResponse,
  BrandPage,
} from "../types/brands.types";

export const brandsApi = {
  getAll: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<BrandPage> => {
    const { data } = await api.get<BrandPage>("/brands", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 50,
        ...(params?.sort ? { sort: params.sort } : {}),
      },
    });
    return data;
  },

  getAllSimple: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<BrandResponse[]> => {
    const page = await brandsApi.getAll(params);
    return page.content;
  },

  getById: async (id: string): Promise<BrandResponse> => {
    const { data } = await api.get<BrandResponse>(`/brands/${id}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<BrandResponse> => {
    const { data } = await api.get<BrandResponse>(`/brands/slug/${slug}`);
    return data;
  },

  getByNormalizedName: async (normalizedName: string): Promise<BrandResponse> => {
    const { data } = await api.get<BrandResponse>(
      `/brands/normalized/${encodeURIComponent(normalizedName)}`
    );
    return data;
  },

  create: async (payload: BrandCreate): Promise<BrandResponse> => {
    const { data } = await api.post<BrandResponse>("/brands", payload);
    return data;
  },
};
