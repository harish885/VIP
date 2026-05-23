import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'plain' | 'raised' | 'tinted';

const TONE: Record<Tone, string> = {
  plain:  'border border-line bg-bg-1',
  raised: 'border border-line bg-bg-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
  tinted: 'border border-line bg-bg-2/40',
};

interface Props extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

/**
 * Surface — single-panel container. Replaces the various ad-hoc
 * "rounded-2xl border border-line bg-bg-1 p-…" recipes scattered across
 * the workspace + diagnostic. Prefer a tinted surface over a nested
 * Card-in-Card.
 */
export function Surface({ tone = 'raised', padding = 'md', className, children, ...rest }: Props) {
  return (
    <div className={cn('rounded-2xl', TONE[tone], PADDING[padding], className)} {...rest}>
      {children}
    </div>
  );
}
