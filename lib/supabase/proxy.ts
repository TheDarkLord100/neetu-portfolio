import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";
import { env } from "@/lib/env";

// Admin addresses only (called from proxy.ts). Refreshes the login session
// cookies on every admin request, so Server Components (which can't write
// cookies) always see a fresh session. Returns whether a valid session exists;
// that is only a first, optimistic check: every admin page and action still
// verifies the session and the admins allowlist on the server (lib/admin/auth.ts).
export async function refreshAdminSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Verifies the token (signature and expiry) and refreshes it when needed.
  const { data } = await supabase.auth.getClaims();
  return { response, signedIn: !!data?.claims?.sub };
}
