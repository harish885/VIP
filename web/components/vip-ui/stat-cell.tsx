import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'default' | 'positive' | 'warning' | 'danger' | 'neutral';

const TONE: Record<Tone, string> = {
  default:  'text-text',
  positive: 'text-green',
  warning:  'text-amber',
  danger:   'text-red',
  neutral:  'text-text-dim',
};

interface Props {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  /** Slot for trailing meta (info button, source badge). */
  trailing?: ReactNode;
  className?: string;
}

const SIZE = {
  sm: { value: 'text-[18px]', label: 'text-[10px]', sub: 'text-[11.5px]' },
  md: { value: 'text-[22px]', label: 'text-[10px]', sub: 'text-[12px]' },
  lg: { value: 'text-[28px]', label: 'text-[10.5px]', sub: 'text-[12.5px]' },
};

/**
 * StatCell — single labelled metric. The atom of every cockpit panel.
 *
 * Compact, dense, no enclosing border by default so callers compose
 * grids of cells without producing "card inside card" stacks.
 */
export function StatCell({
  label,
  value,
  sub,
  tone = 'default',
  size = 'md',
  align = 'left',
  trailing,
  className,
}: Props) {
  const s = SIZE[size];
  return (
    <div className={cn('min-w-0', align === 'right' && 'text-right', className)}>
      <div className={cn(
        'flex items-center gap-1.5 font-mono font-semibold uppercase tracking-eyebrow text-text-faint',
        align === 'right' && 'justify-end',
        s.label,
      )}>
        <span>{label}</span>
        {trailing}
      </div>
      <div className={cn(
        'mt-1.5 font-serif font-medium leading-none tracking-tight',
        s.value,
        TONE[tone],
      )}>
        {value}
      </div>
      {sub && (
        <div className={cn('mt-1.5 text-text-dim', s.sub)}>{sub}</div>
      )}
    </div>
  );
}
