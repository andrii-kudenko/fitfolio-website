/** GET /api/search/members */
export interface MemberSearchCard {
  userId: string;
  username: string;
  avatarUrl: string | null;
  followersCount: number;
  listsCount: number;
  reviewsCount: number;
  following: boolean;
}

export interface MembersSearchResponse {
  results: MemberSearchCard[];
}
