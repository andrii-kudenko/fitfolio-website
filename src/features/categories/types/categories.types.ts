import type { PageResult } from "@/shared/types/pagination";

export interface CategoryCreate {
  parentId?: string | null;
  name: string;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

export interface CategoryResponse {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export type CategoryPage = PageResult<CategoryResponse>;