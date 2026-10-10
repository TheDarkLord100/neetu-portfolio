"use client";

import { usePathname } from "next/navigation";
import { SearchIcon } from "@/components/icons";
import { publicPath, routes } from "@/lib/routes";

type Props = {
  id: string;
  label: string;
  placeholder: string;
  submit: string;
  /** Desktop hides the label visually (it stays for screen readers); phone shows it. */
  variant: "phone" | "desktop";
};

/**
 * Header search: a plain GET form to the catalog (works without JavaScript).
 * Hidden on the catalog itself, which has its own search (DESIGN.md §6.1).
 */
export function HeaderSearch({ id, label, placeholder, submit, variant }: Props) {
  if (publicPath(usePathname()) === routes.works) return null;

  const phone = variant === "phone";
  return (
    <form action={routes.works} method="get" role="search" className={phone ? "w-full" : "w-[22.5rem]"}>
      <label
        htmlFor={id}
        className={phone ? "mb-2 block text-meta font-semibold text-ink-soft" : "sr-only"}
      >
        {label}
      </label>
      <div className="flex">
        <input
          id={id}
          name="q"
          type="search"
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          className={[
            "min-w-0 flex-1 rounded-l-control border border-r-0 border-line-strong bg-paper-raised px-4 text-ui text-ink",
            "placeholder:text-ink-soft",
            phone ? "h-13" : "h-[3.125rem]",
          ].join(" ")}
        />
        <button
          type="submit"
          className={[
            "flex shrink-0 items-center gap-2 rounded-r-control bg-walnut px-4 text-ui font-semibold text-on-walnut",
            "transition-colors hover:bg-walnut-dark active:bg-walnut-dark",
            phone ? "h-13" : "h-[3.125rem]",
          ].join(" ")}
        >
          <SearchIcon />
          {submit}
        </button>
      </div>
    </form>
  );
}
