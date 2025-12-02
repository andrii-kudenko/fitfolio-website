export interface SearchItem {
  title?: string;
  name?: string;
  product_title?: string;
  productName?: string;
  description?: string;
  reviews?: Array<{ text?: string; body?: string; review?: string } | string>;
  url?: string;
  image?: string;
  price?: string;
  [key: string]: any;
}

// Lazy load the items data to avoid bundling the entire JSON file
let itemsDataCache: SearchItem[] | null = null;

async function loadItemsData(): Promise<SearchItem[]> {
  if (itemsDataCache) {
    return itemsDataCache;
  }
  
  const data = await import('@/shared/mocks/all_items_transformed.json');
  itemsDataCache = data.default as SearchItem[];
  return itemsDataCache;
}

/**
 * Search items based on query words matching in description and reviews
 * Adapted from Python search algorithm
 */
export async function searchItems(query: string, limit: number = 10): Promise<SearchItem[]> {
  if (!query.trim()) {
    return [];
  }

  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 0) {
    return [];
  }

  const itemsData = await loadItemsData();
  const results: Array<{ score: number; item: SearchItem }> = [];

  for (const item of itemsData) {
    // Get description
    const desc = String(item.description || '').toLowerCase();
    
    // Get reviews text
    const reviewsText = (item.reviews || [])
      .map(review => {
        if (typeof review === 'string') {
          return review;
        }
        if (typeof review === 'object') {
          return review.text || review.body || review.review || '';
        }
        return '';
      })
      .join(' ')
      .toLowerCase();

    // Combine description and reviews
    const combined = `${desc} ${reviewsText}`;

    // Count how many query words appear in the item
    let score = 0;
    for (const word of words) {
      if (combined.includes(word)) {
        score += 1;
      }
    }

    // Keep items with at least 1 matched word
    if (score > 0) {
      results.push({ score, item });
    }
  }

  // Sort items from highest to lowest score
  results.sort((a, b) => b.score - a.score);

  // Return only item data, limited to specified number
  return results.slice(0, limit).map(result => result.item);
}

/**
 * Get item title from various possible fields
 */
export function getItemTitle(item: SearchItem): string {
  return (
    item.title ||
    item.name ||
    item.product_title ||
    item.productName ||
    'Unknown Item'
  );
}

