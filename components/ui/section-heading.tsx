type Props = {
  title: string;
  subtitle?: string | null;
  /** Element rendered on the right on desktop (e.g. a "see all" link). */
  action?: React.ReactNode;
  id?: string;
  level?: "h2" | "h3";
  className?: string;
};

/** Section heading (`h2` scale) with an optional ink-soft line under it. */
export function SectionHeading({ title, subtitle, action, id, level = "h2", className = "" }: Props) {
  const Heading = level;
  return (
    <div className={`flex items-end justify-between gap-6 ${className}`}>
      <div>
        <Heading id={id} className={level === "h2" ? "text-h2" : "text-h3"}>
          {title}
        </Heading>
        {subtitle && <p className="mt-1 text-meta text-ink-soft desk:text-body">{subtitle}</p>}
      </div>
      {action && <div className="hidden shrink-0 desk:block">{action}</div>}
    </div>
  );
}
