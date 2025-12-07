export interface Collection {
    id: string;
    userId: string;
    title: string;
    slug: string;
    description: string;
    coverImageUrl: string;
    isPublic: boolean;
    isRanked: boolean;
    likeCount: number;
    commentCount: number;
    viewCount: number;
    itemCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CollectionLike {
    id: string;
    userId: string;
    collectionId: string;
    createdAt: string;
}

export interface CollectionItem {
    id: string;
    collectionId: string;
    itemId: string;
    rank: number;
    createdAt: string;
}

