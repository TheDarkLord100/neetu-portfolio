import { env } from "@/lib/env";

export const IMAGES_BUCKET = "images";

/** Public URL for a path in the images bucket (covers/…, author/…, platforms/…). */
export function imageUrl(path: string): string {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${env.supabaseUrl}/storage/v1/object/public/${IMAGES_BUCKET}/${encoded}`;
}
