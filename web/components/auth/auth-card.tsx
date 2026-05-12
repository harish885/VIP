import { cn } from '@/lib/cn';

/**
 * AuthCard — the visual shell used by login, signup, and verify pages.
 * Glass panel, serif headline + lead, slot for the form, slot for the
 * secondary link below ("Don't have an account?", etc).
 */
export function AuthCard({
  eyebrow,
  title,
  accent,
  lead,
  children,
  footer,
  className,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  lead?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  let before = title;
  let highlight = '';
  let after = '';
  if (accent && title.includes(accent)) {
    const idx = title.indexOf(accent);
    before = title.slice(0, idx);
    highlight = accent;
    after = title.slice(idx + accent.length);
  }

  return (
    <div className={cn('glass-strong p-8', className)}>
      <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-gold">
        {eyebrow}
      </div>
      <h1
        className="mb-3 font-serif font-normal leading-tight tracking-tight text-text"
        style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', letterSpacing: '-0.02em' }}
      >
        {before}
        {highlight && <span className="text-gradient-gold">{highlight}</span>}
        {after}
      </h1>
      {lead && <p className="mb-7 text-[14px] leading-relaxed text-text-dim">{lead}</p>}

      {children}

      {footer && (
        <div className="mt-7 border-t border-line-faint pt-6 text-center text-[13px] text-text-dim">
          {footer}
        </div>
      )}
    </div>
  );
}
