export interface Category {
    id: string;
    parentId: string | null;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
}

