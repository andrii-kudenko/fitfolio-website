import { api } from "@/shared/lib/api";
import type {
  CategoryCreate,
  CategoryResponse,
  CategoryPage,
} from "../types/categories.types";

export const categoriesApi = {
  getAll: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<CategoryPage> => {
    const { data } = await api.get<CategoryPage>("/categories", {
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
  }): Promise<CategoryResponse[]> => {
    const page = await categoriesApi.getAll(params);
    return page.content;
  },

  getById: async (id: string): Promise<CategoryResponse> => {
    const { data } = await api.get<CategoryResponse>(`/categories/${id}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<CategoryResponse> => {
    const { data } = await api.get<CategoryResponse>(`/categories/slug/${slug}`);
    return data;
  },

  create: async (payload: CategoryCreate): Promise<CategoryResponse> => {
    const { data } = await api.post<CategoryResponse>("/categories", payload);
    return data;
  },
};
