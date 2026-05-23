'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Option<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

interface Props<T extends string> {
  value: T;
  options: ReadonlyArray<Option<T>>;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

/**
 * Segmented — pill-style tab control used by the cockpit workspace.
 *
 * Roomy on desktop, scroll-on-overflow on mobile. The active option
 * gets the gold border treatment; inactive options stay quiet.
 */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: Props<T>) {
  return (
    <nav
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        '-mx-1 flex shrink-0 items-center gap-1 overflow-x-auto rounded-xl border border-line bg-bg-2/50 p-1',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
              active
                ? 'bg-bg-1 text-text shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                : 'text-text-faint hover:text-text-dim',
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </nav>
  );
}
