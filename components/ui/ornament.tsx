/** Ornament divider (DESIGN.md §4.6): hairlines either side of a small turmeric diamond. Decorative. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center gap-3 ${className}`}>
      <span className="h-px flex-1 bg-line" />
      <span className="flex items-center gap-1 text-turmeric">
        <span className="h-px w-3 bg-turmeric" />
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 1 11 6 6 11 1 6Z" />
        </svg>
        <span className="h-px w-3 bg-turmeric" />
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
