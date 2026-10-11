import admin from "@/messages/admin.json";

// The admin is English-only (one messages file, no language switch).
export type AdminMessages = typeof admin;

export function getAdminMessages(): AdminMessages {
  return admin;
}
