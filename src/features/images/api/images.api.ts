import { api } from "@/shared/lib/api";
import type {
  PresignedUploadRequest,
  PresignedUploadResponse,
} from "../types/images.types";

export const imagesApi = {
  getPresignedUpload: async (
    payload: PresignedUploadRequest
  ): Promise<PresignedUploadResponse> => {
    const { data } = await api.post<PresignedUploadResponse>(
      "/images/presigned-upload",
      payload
    );
    return data;
  },

  /**
   * 1. Get presigned URL from backend
   * 2. PUT file directly to S3
   * 3. Return objectKey for backend to store
   */
  uploadImage: async (
    file: File,
    context: "item" | "profile" | "review",
    entityId?: string
  ): Promise<{ objectKey: string; publicUrl: string }> => {
    const presigned = await imagesApi.getPresignedUpload({
      context,
      entityId: entityId ?? undefined,
      contentType: file.type || "image/webp",
    });

    const uploadResponse = await fetch(presigned.uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "image/webp",
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    return { objectKey: presigned.objectKey, publicUrl: presigned.publicUrl };
  },
};
