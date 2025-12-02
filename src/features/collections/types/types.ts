export interface Collection {
    id: string;
    user_id: string;
    title: string;
    slug: string;
    description: string;
    cover_image_url: string;
    is_public: boolean;
    is_ranked: boolean;
    like_count: number;
    comment_count: number;
    view_count: number;
    item_count: number;
    created_at: string;
    updated_at: string;
}

export interface CollectionLike {
    id: string;
    user_id: string;
    collection_id: string;
    created_at: string;
}

export interface CollectionItem {
    id: string;
    collection_id: string;
    item_id: string;
    rank: number;
    created_at: string;
}

