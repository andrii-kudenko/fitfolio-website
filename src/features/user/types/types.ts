export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
    created_at: string;
    last_login_at: string | null;
}

export interface UserProfile {
    id: string;
    user_id: string;
    username: string;
    bio: string;
    avatar_url: string;
    is_verified: boolean;
    followers_count: number;
    following_count: number;
    collections_count: number;
    tier_lists_count: number;
}

export interface FitProfile {
    id: string;
    is_public: boolean;
    user_id: string;
    gender: string;
    body_type: string;
    height_cm: string;
    weight_kg: string;
    top_size: string;
    bottom_size: string;
    fit_preference: string;
    style_preference: string;
    shoe_size_system: string;
    shoes_size_value: number;
}

export interface UserWithProfileDTO extends User {
    profile: Omit<UserProfile, 'user_id'>;
}
