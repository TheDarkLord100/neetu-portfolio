import { signOut } from "@/app/admin/actions";
import { getAdminState } from "@/lib/admin/auth";
import type { AdminMessages } from "@/lib/admin/messages";
import { format } from "@/lib/i18n/format";

// Signed-in email and "Sign out", shown only to a signed-in admin.
export async function AccountMenu({ messages: m }: { messages: AdminMessages["shell"] }) {
  const state = await getAdminState();
  if (state.kind !== "admin") return null;

  return (
    <form action={signOut} className="flex items-center gap-3">
      <span className="hidden text-meta text-ink-soft desk:inline">{format(m.signedInAs, { email: state.email })}</span>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center rounded-control border border-line-strong bg-paper-raised px-4 text-ui font-semibold hover:bg-label-paper"
      >
        {m.signOut}
      </button>
    </form>
  );
}
