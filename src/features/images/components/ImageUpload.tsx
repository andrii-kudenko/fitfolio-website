"use client";

import { useCallback, useRef, useState } from "react";
import { imagesApi } from "../api/images.api";

type Context = "item" | "profile" | "review";

interface ImageUploadProps {
  context: Context;
  entityId?: string;
  /** Called with objectKey after successful upload. Pass this to the parent form. */
  onUploadSuccess: (objectKey: string, previewUrl: string) => void;
  /** Current preview URL (from existing image or previous upload) */
  currentPreview?: string | null;
  /** Optional class for the container */
  className?: string;
  /** Optional: max file size in bytes (default 5MB) */
  maxSizeBytes?: number;
  /** Optional: accepted file types */
  accept?: string;
}

export function ImageUpload({
  context,
  entityId,
  onUploadSuccess,
  currentPreview,
  className = "",
  maxSizeBytes = 5 * 1024 * 1024,
  accept = "image/jpeg,image/png,image/webp",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentPreview ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayPreview = preview ?? currentPreview;

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);

      if (file.size > maxSizeBytes) {
        setError(`File too large. Max size: ${Math.round(maxSizeBytes / 1024 / 1024)}MB`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file (JPEG, PNG, or WebP)");
        return;
      }

      setUploading(true);

      try {
        const { objectKey, publicUrl } = await imagesApi.uploadImage(
          file,
          context,
          entityId
        );

        setPreview(publicUrl);
        onUploadSuccess(objectKey, publicUrl);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setError(msg);
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [context, entityId, maxSizeBytes, onUploadSuccess]
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-800 border border-gray-600 flex-shrink-0">
          {displayPreview ? (
            <img
              src={displayPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-sm py-2 px-3 rounded-sm bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Choose image"}
          </button>
          <p className="text-xs text-gray-500">
            JPEG, PNG or WebP. Max {Math.round(maxSizeBytes / 1024 / 1024)}MB
          </p>
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
