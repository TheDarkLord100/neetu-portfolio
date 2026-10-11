import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { adminContainer } from "@/components/admin/admin-header";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminMessages } from "@/lib/admin/messages";

const m = getAdminMessages().dashboard;

export const metadata: Metadata = { title: m.title };

// /admin: start page. The sections fill in as the Phase 4 items are built.
export default function AdminHome() {
  return (
    <div className={`${adminContainer} pt-8 pb-16 desk:pt-12`}>
      <Suspense fallback={null}>
        <Dashboard />
      </Suspense>
    </div>
  );
}

async function Dashboard() {
  await requireAdmin();
  return (
    <>
      <h1 className="text-display">{m.welcome}</h1>
      <p className="mt-2 max-w-[var(--reading-max)] text-body text-ink-soft">{m.intro}</p>
      <ul className="mt-8 grid gap-4 tab:grid-cols-2">
        {m.sections.map((s) => (
          <li key={s.key}>
            <Link
              href={s.href}
              className="block h-full rounded-panel border border-line bg-paper-raised p-5 hover:border-line-strong hover:bg-label-paper desk:p-6"
            >
              <h2 className="text-h3 text-walnut underline decoration-turmeric decoration-2 underline-offset-[6px]">{s.title}</h2>
              <p className="mt-2 text-ui text-ink-soft">{s.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
