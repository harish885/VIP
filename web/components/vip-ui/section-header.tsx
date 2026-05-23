import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}

/**
 * SectionHeader — quiet header that sits above a cockpit panel.
 *
 * Eyebrow + serif title + dim description. No background, no border —
 * the panel below owns the surface. Use a single header per panel.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  trailing,
  className,
}: Props) {
  return (
    <header
      className={cn(
        'flex flex-wrap items-end justify-between gap-x-6 gap-y-2',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
            {eyebrow}
          </div>
        )}
        <h2 className="mt-1 font-serif text-[20px] font-medium leading-[1.15] tracking-tight text-text sm:text-[22px]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-[640px] text-[13px] leading-relaxed text-text-dim">
            {description}
          </p>
        )}
      </div>
      {trailing && <div className="flex shrink-0 items-center gap-2">{trailing}</div>}
    </header>
  );
}
