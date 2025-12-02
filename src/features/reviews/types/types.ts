export interface Review {
    id: string;
    user_id: string;
    item_id: string;
    created_at: string;
    updated_at: string;
    is_verified: boolean;
    like_count: number;
    title: string;
    text: string;
    rating: number;
    fit: string;
    comfort: string;
    quality: string;
    time_owned: string;
    purchased_size: string;
    wear_frequency: string;
    climate: string;
    would_recommend: boolean;
    would_buy_again: boolean;
    tags: string[];
}

export interface ReviewMeida {
    id: string;
    review_id: string;
    url: string;
    type: string;
    sort_order: number;
    created_at: string;
}

export interface ReviewLike {
    id: string;
    user_id: string;
    review_id: string;
    created_at: string;
}