import { createBrowserClient as createSsrBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

// For admin Client Components (e.g. the login form). Uses the browser's cookies.
export function createBrowserClient() {
  return createSsrBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
}
