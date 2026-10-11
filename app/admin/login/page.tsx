import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/app/admin/actions";
import { LoginForm } from "@/components/admin/login-form";
import { ADMIN_HOME, getAdminState } from "@/lib/admin/auth";
import { getAdminMessages } from "@/lib/admin/messages";
import { format } from "@/lib/i18n/format";

const m = getAdminMessages().login;

export const metadata: Metadata = { title: m.title };

// /admin/login: the sign-in form. Already signed in as an admin → dashboard;
// signed in without admin access → explain and offer to sign out.
export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-[28rem] px-4 pt-10 pb-16 desk:pt-16">
      <h1 className="text-display">{m.title}</h1>
      <p className="mt-2 text-body text-ink-soft">{m.intro}</p>
      <div className="mt-8 rounded-panel border border-line bg-paper-raised p-5 tab:p-7">
        <Suspense fallback={null}>
          <LoginGate />
        </Suspense>
      </div>
    </div>
  );
}

async function LoginGate() {
  const state = await getAdminState();
  if (state.kind === "admin") redirect(ADMIN_HOME);

  if (state.kind === "notAdmin") {
    return (
      <div>
        <h2 className="text-h3">{m.noAccess.title}</h2>
        <p className="mt-2 text-body">{format(m.noAccess.body, { email: state.email })}</p>
        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="inline-flex min-h-13 w-full items-center justify-center rounded-control bg-walnut px-6 text-ui font-semibold text-on-walnut hover:bg-walnut-dark"
          >
            {m.noAccess.signOut}
          </button>
        </form>
      </div>
    );
  }

  return <LoginForm messages={m} />;
}
