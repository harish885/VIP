/**
 * FieldShell — label + hint + slot pattern used by every form row.
 * Keeps the type hierarchy consistent across all 17 inputs.
 */
export function FieldShell({
  label,
  hint,
  required,
  children,
  inline,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  /** Inline = label on the left, control on the right. Used for the 1–5
   *  qualitative rows. Stacked = label on top (default). */
  inline?: boolean;
}) {
  if (inline) {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-line-faint py-4 last:border-b-0">
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] font-bold uppercase tracking-eyebrow text-text">
              {label}
            </span>
            {required && <span className="font-mono text-[11px] text-gold">*</span>}
          </div>
          {hint && (
            <p className="mt-0.5 text-[12px] leading-snug text-text-dim">{hint}</p>
          )}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    );
  }

  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-dim">
          {label}
        </span>
        {required && <span className="font-mono text-[10px] text-gold">*</span>}
      </div>
      {children}
      {hint && <span className="text-[11px] text-text-faint">{hint}</span>}
    </label>
  );
}
