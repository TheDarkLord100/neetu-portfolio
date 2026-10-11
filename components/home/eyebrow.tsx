/** "— विशेष रचना": turmeric bar + small label. */
export function Eyebrow({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p className={`flex items-center gap-3 text-meta font-semibold text-ink-soft ${className}`}>
      <span aria-hidden="true" className="h-0.5 w-7 bg-turmeric" />
      {text}
    </p>
  );
}
