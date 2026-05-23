import { Database, PenLine, Sigma } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ValueSource = 'aida' | 'override' | 'computed' | 'proxy';

interface Props {
  source: ValueSource;
  /** Short label override (defaults: AIDA · Override · Computed · Proxy). */
  label?: string;
  className?: string;
}

const STYLE: Record<ValueSource, { tone: string; icon: typeof Database; text: string }> = {
  aida:     { tone: 'border-cyan/30 bg-cyan/[0.08] text-cyan',     icon: Database, text: 'AIDA' },
  override: { tone: 'border-gold/35 bg-gold/[0.10] text-gold',     icon: PenLine,  text: 'You' },
  computed: { tone: 'border-purple/30 bg-purple/[0.08] text-purple', icon: Sigma, text: 'Computed' },
  proxy:    { tone: 'border-text-faint/30 bg-bg-2/70 text-text-dim', icon: Sigma, text: 'Proxy' },
};

/**
 * SourceBadge — tells the reader where a number came from in one glance.
 *
 *   · AIDA      — pulled from the BvD snapshot
 *   · You       — entrepreneur typed it in via Financials step
 *   · Computed  — engine output
 *   · Proxy     — derived from qualitative answers
 */
export function SourceBadge({ source, label, className }: Props) {
  const s = STYLE[source];
  const Icon = s.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em]',
        s.tone,
        className,
      )}
    >
      <Icon size={9} strokeWidth={2.5} />
      {label ?? s.text}
    </span>
  );
}
