export interface TierList {
    id: string;
    user_id: string;
    title: string;
    slug: string;
    description: string;
    cover_image_url: string;
    is_public: boolean;
    like_count: number;
    comment_count: number;
    item_count: number;
    view_count: number;
    created_at: string;
    updated_at: string;
}

export interface TierListLike {
    id: string;
    user_id: string;
    tier_list_id: string;
    created_at: string;
}

export interface Tier {
    id: string;
    tier_list_id: string;
    label: string;
    name: string;
    color: string;
    position: number;
}

export interface TierListItem {
    id: string;
    tier_list_id: string;
    tier_id: string;
    item_id: string;
    position: number;
    created_at: string;
}

