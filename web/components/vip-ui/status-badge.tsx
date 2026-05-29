import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone =
  | 'neutral'
  | 'positive'
  | 'warning'
  | 'danger'
  | 'info'
  | 'gold'
  | 'purple';

const TONE: Record<Tone, string> = {
  neutral:  'border-line bg-bg-2/70 text-text-dim',
  positive: 'border-green/30 bg-green/[0.07] text-green',
  warning:  'border-amber/30 bg-amber/[0.08] text-amber',
  danger:   'border-red/30 bg-red/[0.07] text-red',
  info:     'border-cyan/30 bg-cyan/[0.07] text-cyan',
  gold:     'border-gold/35 bg-gold/[0.08] text-gold',
  purple:   'border-purple/30 bg-purple/[0.07] text-purple',
};

interface Props {
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * StatusBadge — small chip used for state indicators across the studio.
 * Examples: "Diagnosed · 6h ago", "Demo mode", "Risk · MEDIUM".
 */
export function StatusBadge({ tone = 'neutral', icon, className, children }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]',
        TONE[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
