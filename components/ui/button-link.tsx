import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";

type Props = {
  href: string;
  children: React.ReactNode;
  /** DESIGN.md §6.5: walnut fill, or paper with a border. */
  variant?: "primary" | "outline";
  /** Trailing › chevron. */
  chevron?: boolean;
  /** Full width below 1024px (DESIGN.md §6.4 phone pattern). Default true. */
  fullWidthOnPhone?: boolean;
  /** Opens in a new tab with the screen-reader note. */
  external?: { newWindowLabel: string };
  className?: string;
};

const base =
  "inline-flex min-h-13 items-center justify-center gap-2 rounded-control px-6 text-ui font-semibold transition-colors";
const variants = {
  primary: "bg-walnut text-on-walnut hover:bg-walnut-dark active:bg-walnut-dark",
  outline: "border border-line-strong bg-paper-raised text-ink hover:bg-label-paper active:bg-label-paper",
};

/** A link styled as a button (DESIGN.md §6.5). */
export function ButtonLink({
  href,
  children,
  variant = "outline",
  chevron = false,
  fullWidthOnPhone = true,
  external,
  className = "",
}: Props) {
  const classes = `${base} ${variants[variant]} ${fullWidthOnPhone ? "w-full desk:w-auto" : ""} ${className}`;
  const content = (
    <>
      {children}
      {chevron && <ChevronRightIcon size={18} />}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
        <span className="sr-only"> {external.newWindowLabel}</span>
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
