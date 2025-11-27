// Helper function to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Load items data
let itemsDataCache: any[] | null = null;

async function loadItemsData(): Promise<any[]> {
  if (itemsDataCache) {
    return itemsDataCache;
  }
  
  const data = await import('@/mocks/all_items_transformed.json');
  itemsDataCache = data.default as any[];
  return itemsDataCache;
}

// Find item by slug
export async function getItemBySlug(slug: string): Promise<any | null> {
  const items = await loadItemsData();
  
  // Try to find by exact slug match first
  const item = items.find(item => {
    const itemSlug = generateSlug(item.title || '');
    return itemSlug === slug;
  });
  
  return item || null;
}

// Get related items (same brand or category)
export async function getRelatedItems(currentItem: any, limit: number = 5): Promise<any[]> {
  const items = await loadItemsData();
  const currentBrand = currentItem?.attributes?.brand;
  const currentTitle = currentItem?.title;
  
  const related = items
    .filter(item => {
      // Exclude current item
      if (item.title === currentTitle) return false;
      // Match by brand if available
      if (currentBrand && item.attributes?.brand === currentBrand) return true;
      return false;
    })
    .slice(0, limit);
  
  return related;
}

