import type { PageResult } from "@/shared/types/pagination";

export interface BrandCreate {
  contributorId?: string | null;
  name: string;
  website?: string | null;
  logo?: string | null;
  type?: string | null;
  status?: string | null;
}

export interface BrandResponse {
  id: string;
  contributorId: string | null;
  name: string;
  normalizedName: string;
  slug: string;
  website: string | null;
  logo: string | null;
  type: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type BrandPage = PageResult<BrandResponse>;
