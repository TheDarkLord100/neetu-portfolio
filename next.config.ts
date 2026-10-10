import type { NextConfig } from "next";
// Validates env at startup, so dev and build fail early with a clear message.
import { env } from "./lib/env";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Only our Supabase images bucket (covers/, author/, platforms/).
    remotePatterns: [new URL(`${env.supabaseUrl}/storage/v1/object/public/images/**`)],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
