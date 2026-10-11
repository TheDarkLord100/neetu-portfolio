"use client";

import { useCallback, useSyncExternalStore } from "react";

// The reader's saved works (CLAUDE.md "Favourites", Data.md "Client-only data").
// localStorage only, this device only. Every access is wrapped in try/catch and
// failure counts as an empty list. The server snapshot is always empty, so the
// first render matches the server HTML (no hydration mismatch).

export const SAVED_KEY = "neetu-saved-v1";
const CHANGE_EVENT = "neetu-saved-change";
const EMPTY = "[]";

function readRaw(): string {
  try {
    return window.localStorage.getItem(SAVED_KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Parses the stored list; anything malformed becomes an empty list. */
export function parseSaved(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(slugs));
  } catch {
    // Storage full or blocked: the change is simply not kept.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  // "storage" fires for other tabs; CHANGE_EVENT for this tab.
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === SAVED_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Saved slugs, newest first. Empty during server render and before mount. */
export function useSavedWorks() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => EMPTY);
  const slugs = parseSaved(raw);

  const isSaved = useCallback((slug: string) => parseSaved(raw).includes(slug), [raw]);

  const toggle = useCallback((slug: string) => {
    const current = parseSaved(readRaw());
    write(current.includes(slug) ? current.filter((s) => s !== slug) : [slug, ...current]);
  }, []);

  const remove = useCallback((slug: string) => {
    write(parseSaved(readRaw()).filter((s) => s !== slug));
  }, []);

  /** Drops slugs that no longer resolve (deleted or unpublished works). */
  const prune = useCallback((validSlugs: Iterable<string>) => {
    const valid = new Set(validSlugs);
    const current = parseSaved(readRaw());
    const kept = current.filter((s) => valid.has(s));
    if (kept.length !== current.length) write(kept);
  }, []);

  return { slugs, isSaved, toggle, remove, prune };
}
