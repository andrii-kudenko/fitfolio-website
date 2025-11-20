export interface Item {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    imageUrl: string;
    rating: number;
    description: string;
    tags: string[];
  }
  
  export interface ItemComparisonData {
    idA: string;
    idB: string;
    criteria: string[];
  }
  
  export interface CreateItemDTO {
    name: string;
    brand: string;
    price: number;
    category: string;
    imageUrl?: string;
    description?: string;
  }
  