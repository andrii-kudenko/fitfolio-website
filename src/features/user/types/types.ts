export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    createdAt: string;
    lastLoginAt: string | null;
}

export interface UserProfile {
    id: string;
    userId: string;
    username: string;
    bio: string;
    avatarUrl: string;
    isVerified: boolean;
    followersCount: number;
    followingCount: number;
    collectionsCount: number;
    tierListsCount: number;
}

export interface FitProfile {
    id: string;
    isPublic: boolean;
    userId: string;
    gender: string;
    bodyType: string;
    heightCm: string;
    weightKg: string;
    topSize: string;
    bottomSize: string;
    fitPreference: string;
    stylePreference: string;
    shoeSizeSystem: string;
    shoesSizeValue: number;
}

export interface UserWithProfileDTO extends User {
    profile: Omit<UserProfile, 'userId'>;
}
