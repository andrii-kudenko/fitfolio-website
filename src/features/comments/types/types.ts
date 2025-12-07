export interface Comment {
    id: string;
    userId: string;
    parentId: string | null;
    subjectId: string;
    subjectType: string;
    text: string;
    likeCount: number;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CommentLike {
    id: string;
    userId: string;
    commentId: string;
    createdAt: string;
}