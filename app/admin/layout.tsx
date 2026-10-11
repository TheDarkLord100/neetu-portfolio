import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountMenu, AdminNavSlot } from "@/components/admin/account-menu";
import { AdminHeader } from "@/components/admin/admin-header";
import { fontVariables } from "@/lib/fonts";
import { getAdminMessages } from "@/lib/admin/messages";
import "../globals.css";

const m = getAdminMessages();

export const metadata: Metadata = {
  title: { default: m.meta.title, template: m.meta.titleTemplate },
  robots: { index: false, follow: false },
};

// Admin root layout: its own <html lang="en"> (the admin is English-only),
// plain paper without the texture, no public header or footer. Moving between
// the admin and the public site is a full page load (different root layouts).
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-walnut focus:px-4 focus:py-3 focus:text-ui focus:font-semibold focus:text-on-walnut"
        >
          {m.shell.skipToContent}
        </a>
        <AdminHeader
          messages={m.shell}
          nav={
            <Suspense fallback={null}>
              <AdminNavSlot messages={m.nav} />
            </Suspense>
          }
          account={
            // Reads the login cookie, so it streams in per request.
            <Suspense fallback={null}>
              <AccountMenu messages={m.shell} />
            </Suspense>
          }
        />
        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}

