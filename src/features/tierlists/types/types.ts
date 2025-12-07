export interface TierList {
    id: string;
    userId: string;
    title: string;
    slug: string;
    description: string;
    coverImageUrl: string;
    isPublic: boolean;
    likeCount: number;
    commentCount: number;
    itemCount: number;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface TierListLike {
    id: string;
    userId: string;
    tierListId: string;
    createdAt: string;
}

export interface Tier {
    id: string;
    tierListId: string;
    label: string;
    name: string;
    color: string;
    position: number;
}

export interface TierListItem {
    id: string;
    tierListId: string;
    tierId: string;
    itemId: string;
    position: number;
    createdAt: string;
}

