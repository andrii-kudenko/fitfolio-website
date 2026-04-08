const MAX_DIMENSION = 4096;
const JPEG_QUALITY = 0.92;
/** Matte for `contain` (letterboxing) and transparent edges when resizing — fits dark UI. */
const NORMALIZE_BACKGROUND = "#000000";

function scaleToFit(width: number, height: number, maxSide: number): { width: number; height: number } {
  if (width <= maxSide && height <= maxSide) {
    return { width, height };
  }
  const scale = maxSide / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function drawBitmapToSquare(
  ctx: CanvasRenderingContext2D,
  bitmap: ImageBitmap,
  side: number,
  fit: "cover" | "contain"
): void {
  const w = bitmap.width;
  const h = bitmap.height;
  ctx.fillStyle = NORMALIZE_BACKGROUND;
  ctx.fillRect(0, 0, side, side);

  if (fit === "contain") {
    const scale = Math.min(side / w, side / h);
    const dw = Math.max(1, Math.round(w * scale));
    const dh = Math.max(1, Math.round(h * scale));
    ctx.drawImage(bitmap, (side - dw) / 2, (side - dh) / 2, dw, dh);
  } else {
    const scale = Math.max(side / w, side / h);
    const dw = w * scale;
    const dh = h * scale;
    ctx.drawImage(bitmap, (side - dw) / 2, (side - dh) / 2, dw, dh);
  }
}

export type NormalizeImageFit = "cover" | "contain";

/**
 * Decodes an image in the browser and re-encodes as baseline JPEG (sRGB via canvas).
 * Strips exotic metadata/ICC issues that break server-side ImageIO / APIs.
 */
export async function fileToNormalizedJpeg(
  file: File,
  options?: {
    maxDimension?: number;
    quality?: number;
    /** If set, output is exactly squareSide × squareSide (fit applies). Ignores maxDimension for output size. */
    squareSide?: number;
    fit?: NormalizeImageFit;
  }
): Promise<File> {
  const maxDimension = options?.maxDimension ?? MAX_DIMENSION;
  const quality = options?.quality ?? JPEG_QUALITY;
  const squareSide = options?.squareSide;
  const fit = options?.fit ?? "contain";

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    } as ImageBitmapOptions);
  } catch {
    throw new Error("Could not decode image in this browser");
  }

  try {
    let width = bitmap.width;
    let height = bitmap.height;
    if (!width || !height) {
      throw new Error("Invalid image dimensions");
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    if (squareSide != null && squareSide > 0) {
      canvas.width = squareSide;
      canvas.height = squareSide;
      drawBitmapToSquare(ctx, bitmap, squareSide, fit);
    } else {
      const scaled = scaleToFit(width, height, maxDimension);
      width = scaled.width;
      height = scaled.height;
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = NORMALIZE_BACKGROUND;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(bitmap, 0, 0, width, height);
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
    });
    if (!blob) {
      throw new Error("Could not encode JPEG");
    }

    const stem = file.name.replace(/\.[^/.]+$/, "") || "image";
    return new File([blob], `${stem}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
