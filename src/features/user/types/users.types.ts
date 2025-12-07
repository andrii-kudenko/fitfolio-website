// -----------------------------
// User DTOs
// -----------------------------

// Java: record UserCreate(String email, String firstName, String lastName, String role, String status)
export interface UserCreate {
    email: string;
    firstName: string;
    lastName: string;
    role?: string;   // optional – can be omitted, backend can default
    status?: string; // optional
  }
  
  // Java: record UserResponse(UUID id, String email, String firstName, String lastName,
  //                           String role, String status, OffsetDateTime createdAt, OffsetDateTime lastLoginAt)
  export interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    createdAt: string;
    lastLoginAt: string | null;
  }
  
  // -----------------------------
  // UserProfile DTOs
  // -----------------------------
  
  // Java: record UserProfileCreate(String username, String bio, String avatarUrl)
  export interface UserProfileCreate {
    username: string;
    bio?: string | null;
    avatarUrl?: string | null;
  }
  
  // Java: record UserProfileResponse(UUID id, UUID userId, String username, String bio,
  //                                  String avatarUrl, boolean isVerified,
  //                                  int followersCount, int followingCount,
  //                                  int collectionsCount, int tierListsCount)
  export interface UserProfileResponse {
    id: string;
    userId: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
    followersCount: number;
    followingCount: number;
    collectionsCount: number;
    tierListsCount: number;
  }
  
  // -----------------------------
  // FitProfile DTOs
  // -----------------------------
  
  // Java: record FitProfileCreate(Boolean isPublic, String gender, String bodyType,
  //                               String heightCm, String weightKg, String topSize,
  //                               String bottomSize, String fitPreference,
  //                               String stylePreference, String shoeSizeSystem,
  //                               Double shoesSizeValue)
  export interface FitProfileCreate {
    isPublic?: boolean;
    gender?: string | null;
    bodyType?: string | null;
    heightCm?: string | null;
    weightKg?: string | null;
    topSize?: string | null;
    bottomSize?: string | null;
    fitPreference?: string | null;
    stylePreference?: string | null;
    shoeSizeSystem?: string | null;
    shoesSizeValue?: number | null;
  }
  
  // Java: record FitProfileResponse(UUID id, boolean isPublic, UUID userId,
  //                                 String gender, String bodyType, String heightCm,
  //                                 String weightKg, String topSize, String bottomSize,
  //                                 String fitPreference, String stylePreference,
  //                                 String shoeSizeSystem, Double shoesSizeValue)
  export interface FitProfileResponse {
    id: string;
    isPublic: boolean;
    userId: string;
    gender: string | null;
    bodyType: string | null;
    heightCm: string | null;
    weightKg: string | null;
    topSize: string | null;
    bottomSize: string | null;
    fitPreference: string | null;
    stylePreference: string | null;
    shoeSizeSystem: string | null;
    shoesSizeValue: number | null;
  }
  
  // -----------------------------
  // Pagination envelope
  // -----------------------------
  
  // matches Spring's `page` object you already saw from /items
  export interface PageMeta {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  }
  
  export interface PageResult<T> {
    content: T[];
    page: PageMeta;
  }
  
  export type UserPage = PageResult<UserResponse>;


// export interface User {
//     id: string;
//     email: string;
//     firstName: string;
//     lastName: string;
//     role: string;
//     status: string;
//     createdAt: string;
//     lastLoginAt: string | null;
// }

// export interface UserProfile {
//     id: string;
//     userId: string;
//     username: string;
//     bio: string;
//     avatarUrl: string;
//     isVerified: boolean;
//     followersCount: number;
//     followingCount: number;
//     collectionsCount: number;
//     tierListsCount: number;
// }

// export interface FitProfile {
//     id: string;
//     isPublic: boolean;
//     userId: string;
//     gender: string;
//     bodyType: string;
//     heightCm: string;
//     weightKg: string;
//     topSize: string;
//     bottomSize: string;
//     fitPreference: string;
//     stylePreference: string;
//     shoeSizeSystem: string;
//     shoesSizeValue: number;
// }

// export interface UserWithProfileDTO extends User {
//     profile: Omit<UserProfile, 'userId'>;
// }
