import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// /robots.txt. Only the production site is open to search engines (never the
// admin); Vercel preview sites and local builds are closed entirely.
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
