import { createBrowserClient as createSsrBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { env } from "@/lib/env";

// For admin Client Components (e.g. the login form). Uses the browser's cookies.
export function createBrowserClient() {
  return createSsrBrowserClient<Database>(env.supabaseUrl, env.supabasePublishableKey);
}
