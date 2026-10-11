"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminMessages } from "@/lib/admin/messages";

const LINKS = [
  { key: "dashboard", href: "/admin" },
  { key: "works", href: "/admin/works" },
  { key: "platforms", href: "/admin/platforms" },
  { key: "profile", href: "/admin/profile" },
  { key: "awards", href: "/admin/awards" },
] as const;

// Admin sections. Wraps on phone. Forms with unsaved changes catch these
// clicks and ask first (useUnsavedWarning).
export function AdminNav({ messages: m }: { messages: AdminMessages["nav"] }) {
  const pathname = usePathname();
  const isCurrent = (href: string) => (href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav aria-label={m.label}>
      <ul className="flex flex-wrap gap-x-1 gap-y-1">
        {LINKS.map((link) => {
          const current = isCurrent(link.href);
          return (
            <li key={link.key}>
              <Link
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-control px-3 text-ui font-medium ${
                  current ? "bg-walnut text-on-walnut" : "text-ink hover:bg-label-paper"
                }`}
              >
                {m[link.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
