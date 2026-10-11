import { OpenBookIcon } from "@/components/icons";

type Props = {
  heading: string;
  body: string;
  /** Usually a primary button (DESIGN.md §6.19). */
  action?: React.ReactNode;
  className?: string;
};

/** Empty state panel (DESIGN.md §6.19): open-book icon, heading, guidance, action. */
export function EmptyState({ heading, body, action, className = "" }: Props) {
  return (
    <div className={`rounded-panel border border-line bg-paper-raised px-5 py-10 text-center desk:px-10 desk:py-12 ${className}`}>
      <OpenBookIcon size={64} className="mx-auto text-ink/70" />
      <h2 className="mt-4 text-h3">{heading}</h2>
      <p className="mx-auto mt-3 max-w-[40rem] text-body text-ink-soft">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
