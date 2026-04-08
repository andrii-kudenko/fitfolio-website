import type { EnrichmentResponse } from "../types/enrichment.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.fitfolio.app";

export const enrichmentApi = {
  /**
   * Get metadata tags + generated itemName from OpenAI (image + short user prompt + category + brand).
   * Call this before creating the item, then pass itemName as name and metadata to itemsApi.create.
   */
  getMetadata: async (params: {
    image: File;
    itemPrompt: string;
    category: string;
    brand: string;
  }): Promise<EnrichmentResponse> => {
    const formData = new FormData();
    formData.append("image", params.image);
    formData.append("itemPrompt", params.itemPrompt);
    formData.append("category", params.category);
    formData.append("brand", params.brand);

    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/enrichment/metadata`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Enrichment failed: ${res.status}`);
    }
    return res.json();
  },
};
