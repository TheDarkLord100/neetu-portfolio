import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";

// The one place admin access is decided (server only). Every admin page and
// server action goes through requireAdmin(); proxy.ts only does a first,
// optimistic check.

export const ADMIN_HOME = "/admin";
export const ADMIN_LOGIN = "/admin/login";

export type AdminState =
  | { kind: "signedOut" }
  | { kind: "notAdmin"; email: string }
  | { kind: "admin"; email: string };

/**
 * Who is signed in, verified with Supabase (token signature and expiry), and
 * whether they are on the admins allowlist (checked by the database itself
 * through is_admin()). Memoised per request.
 */
export const getAdminState = cache(async (): Promise<AdminState> => {
  // Per request only: the token check compares its expiry with the current
  // time (Date.now()), which must never run during prerendering.
  await connection();
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return { kind: "signedOut" };

  const email = typeof claims.email === "string" ? claims.email : "";
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || isAdmin !== true) return { kind: "notAdmin", email };
  return { kind: "admin", email };
});

/** For admin pages and server actions: continue only for a signed-in admin. */
export async function requireAdmin(): Promise<{ email: string }> {
  const state = await getAdminState();
  // Signed-out visitors and non-admins both go to the login page, which
  // explains a missing permission and offers to sign out.
  if (state.kind !== "admin") redirect(ADMIN_LOGIN);
  return { email: state.email };
}
