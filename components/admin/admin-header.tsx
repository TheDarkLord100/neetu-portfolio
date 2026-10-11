import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import type { AdminMessages } from "@/lib/admin/messages";

export const adminContainer = "mx-auto w-full max-w-[75rem] px-4 tab:px-6 desk:px-8";

// Admin top bar (DESIGN.md §10): name + "Admin", a link to the public site,
// and the signed-in account (streamed in per request).
export function AdminHeader({ messages: m, account }: { messages: AdminMessages["shell"]; account: ReactNode }) {
  return (
    <header className="border-b border-line bg-paper-raised">
      <div className={`${adminContainer} flex min-h-16 flex-wrap items-center gap-x-6 gap-y-2 py-2`}>
        <Link href="/admin" className="flex min-h-11 items-center gap-2.5">
          <span className="font-heading text-h3 leading-tight">{m.brand}</span>
          <span className="rounded-full bg-walnut px-2.5 py-0.5 text-meta font-semibold text-on-walnut">{m.area}</span>
        </Link>
        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1 text-ui font-medium text-walnut underline underline-offset-4"
          >
            {m.viewSite}
            <ArrowUpRightIcon size={16} />
            <span className="sr-only"> {m.newWindow}</span>
          </a>
          {account}
        </div>
      </div>
    </header>
  );
}
