import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { adminContainer } from "@/components/admin/admin-header";
import { WorksList } from "@/components/admin/works-list";
import { loadAdminStore } from "@/lib/admin/data";
import { getAdminMessages } from "@/lib/admin/messages";
import { toAdminRows } from "@/lib/admin/works";

const m = getAdminMessages();

export const metadata: Metadata = { title: m.worksList.title };

// /admin/works: every work, drafts included. Filtering happens in the browser.
export default function AdminWorksPage() {
  return (
    <div className={`${adminContainer} pt-8 pb-16 desk:pt-10`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display">{m.worksList.title}</h1>
          <p className="mt-2 text-body text-ink-soft">{m.worksList.intro}</p>
        </div>
        <Link
          href="/admin/works/new"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-walnut px-5 text-ui font-semibold text-on-walnut hover:bg-walnut-dark tab:w-auto"
        >
          + {m.worksList.newWork}
        </Link>
      </div>
      <Suspense fallback={null}>
        <Works />
      </Suspense>
    </div>
  );
}

async function Works() {
  const rows = toAdminRows(await loadAdminStore());
  return <WorksList rows={rows} messages={m} />;
}
