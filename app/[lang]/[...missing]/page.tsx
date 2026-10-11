import { notFound } from "next/navigation";

// Any address that matches no page shows the site's own "not found" page
// (app/[lang]/not-found.tsx) instead of the plain default.
export default function Missing() {
  notFound();
}
