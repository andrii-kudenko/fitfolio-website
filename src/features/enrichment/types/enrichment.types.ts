export interface EnrichmentResponse {
  themes: string[];
  occasions: string[];
  vibes: string[];
  styles: string[];
  aesthetic: string[];
  fit: string[];
  season: string[];
  function: string[];
  /** Plain-text product copy from the model (2–4 sentences). */
  description: string;
}
