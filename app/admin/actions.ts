"use server";

import { redirect } from "next/navigation";
import { ADMIN_HOME, ADMIN_LOGIN } from "@/lib/admin/auth";
import { createServerClient } from "@/lib/supabase/server";

export type LoginError = "missing" | "invalid" | "notAdmin" | "tooMany" | "unknown";
export type LoginState = { error: LoginError | null; email: string };

// Email + password sign-in. Sign-ups are disabled in Supabase, so only accounts
// created in the dashboard exist; on top of that the account must be on the
// admins allowlist, or it is signed straight back out.
export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "missing", email };

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const code = error.code ?? "";
    if (code === "invalid_credentials" || code === "email_not_confirmed" || error.status === 400) {
      return { error: "invalid", email };
    }
    if (error.status === 429 || code === "over_request_rate_limit") return { error: "tooMany", email };
    return { error: "unknown", email };
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "notAdmin", email };
  }

  redirect(ADMIN_HOME);
}

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect(ADMIN_LOGIN);
}
