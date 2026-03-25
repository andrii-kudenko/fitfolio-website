export interface PresignedUploadRequest {
  context: "item" | "profile" | "review";
  entityId?: string;
  contentType?: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
}
