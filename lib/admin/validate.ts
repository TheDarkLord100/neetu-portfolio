import { SLUG_PATTERN } from "./slug";

// Small shared checks for admin forms. Error codes match messages.common.

export type CommonError = "required" | "invalidSlug" | "slugTaken" | "invalidUrl" | "invalidNumber" | "invalidYear" | "invalidEmail";
export type Errors<K extends string> = Partial<Record<K, CommonError>>;

export const clean = (value: string | null | undefined) => (value ?? "").trim();
export const orNull = (value: string | null | undefined) => clean(value) || null;

export const isUrl = (value: string) => /^https?:\/\/\S+$/.test(value);
export const isSlug = (value: string) => SLUG_PATTERN.test(value);
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export type ActionResult<K extends string = string> = { ok: true; id?: string } | { ok: false; errors?: Errors<K>; message?: string };
