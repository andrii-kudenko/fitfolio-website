export interface Comment {
    id: string;
    user_id: string;
    parent_id: string | null;
    subject_id: string;
    subject_type: string;
    text: string;
    like_count: number;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface CommentLike {
    id: string;
    user_id: string;
    comment_id: string;
    created_at: string;
}