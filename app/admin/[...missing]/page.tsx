import { notFound } from "next/navigation";

// Unknown admin addresses show the admin's own "not found" page
// (app/admin/not-found.tsx). Signed-out visitors never get here: proxy.ts
// sends them to the login page first. Nothing on that page is private.
export default function MissingAdminPage() {
  notFound();
}
