export interface EnrichmentResponse {
  themes: string[];
  occasions: string[];
  vibes: string[];
  styles: string[];
  aesthetic: string[];
  fit: string[];
  season: string[];
  function: string[];
  /** Catalog-style title from the model (Title Case). */
  itemName: string;
  /** Plain-text product copy from the model (2–4 sentences). */
  description: string;
  /** MiniLM search vector from ML API when embed succeeds; may be empty if ML is down. */
  embedding?: number[];
}
