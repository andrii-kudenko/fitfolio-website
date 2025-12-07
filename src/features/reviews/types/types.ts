export interface Review {
    id: string;
    userId: string;
    itemId: string;
    createdAt: string;
    updatedAt: string;
    isVerified: boolean;
    likeCount: number;
    title: string;
    text: string;
    rating: number;
    fit: string;
    comfort: string;
    quality: string;
    timeOwned: string;
    purchasedSize: string;
    wearFrequency: string;
    climate: string;
    wouldRecommend: boolean;
    wouldBuyAgain: boolean;
    tags: string[];
}

export interface ReviewMeida {
    id: string;
    reviewId: string;
    url: string;
    type: string;
    sortOrder: number;
    createdAt: string;
}

export interface ReviewLike {
    id: string;
    userId: string;
    reviewId: string;
    createdAt: string;
}