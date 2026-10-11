import { createServerClient as createSsrClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { env } from "@/lib/env";

// For admin pages and server actions only. Reads the login cookies, which
// makes the route dynamic, so don't use it on public pages.
// Create a new client per request; never share one across requests.
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSsrClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore: proxy.ts refreshes the session on every admin request.
        }
      },
    },
  });
}
