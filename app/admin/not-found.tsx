import Link from "next/link";
import { adminContainer } from "@/components/admin/admin-header";
import { getAdminMessages } from "@/lib/admin/messages";

const m = getAdminMessages().notFound;

// Inside the admin shell.
export default function AdminNotFound() {
  return (
    <div className={`${adminContainer} pt-10 pb-16 desk:pt-16`}>
      <h1 className="text-display">{m.title}</h1>
      <p className="mt-2 text-body text-ink-soft">{m.body}</p>
      <Link
        href="/admin"
        className="mt-6 inline-flex min-h-13 items-center rounded-control bg-walnut px-6 text-ui font-semibold text-on-walnut hover:bg-walnut-dark"
      >
        {m.back}
      </Link>
    </div>
  );
}
