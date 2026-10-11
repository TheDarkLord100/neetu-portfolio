// Browser-only: turns any picked image into a WebP before upload, scaled down
// to a sensible size for its use. No dependency: the browser decodes the file
// (createImageBitmap) and encodes WebP through a canvas.

export type MediaFolder = "covers" | "author" | "platforms";

/** Longest side, in pixels, per folder (covers are shown up to ~300px wide at 2–3× density). */
const MAX_SIDE: Record<MediaFolder, number> = { covers: 1400, author: 1600, platforms: 256 };
const QUALITY = 0.85;

export class ImageConvertError extends Error {
  constructor(public reason: "notImage" | "unsupported") {
    super(reason);
  }
}

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
  } catch {
    // Fallback for formats createImageBitmap can't read but <img> can.
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} };
    } catch {
      throw new ImageConvertError("notImage");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

export async function convertToWebp(file: File, folder: MediaFolder): Promise<{ blob: Blob; width: number; height: number }> {
  const image = await decode(file);
  const scale = Math.min(1, MAX_SIDE[folder] / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageConvertError("unsupported");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image.source, 0, 0, width, height);
  image.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
  // Browsers that can't encode WebP silently return PNG instead.
  if (!blob || blob.type !== "image/webp") throw new ImageConvertError("unsupported");
  return { blob, width, height };
}

/** "My Photo (1).JPG" → "covers/my-photo-1-k3f9.webp": readable, unique, never reused. */
export function mediaPath(folder: MediaFolder, originalName: string): string {
  const base =
    originalName
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${folder}/${base}-${suffix}.webp`;
}
