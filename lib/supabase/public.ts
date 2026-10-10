import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// For public pages. Never reads cookies, so pages stay static/cacheable.
// Runs as the anonymous role; RLS limits it to published works.
export function createPublicClient() {
  return createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
