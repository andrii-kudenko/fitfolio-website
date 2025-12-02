export interface Category {
    id: string;
    parent_id: string | null;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
}

