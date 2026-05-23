import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState — calm "nothing here yet" panel. Dashed border, soft fill,
 * single CTA slot. Used by tabs that need a diagnostic before they have
 * anything to show.
 */
export function EmptyState({ icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-bg-2/30 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold/[0.08] text-gold">
          {icon}
        </span>
      )}
      <div>
        <div className="font-serif text-[18px] font-medium tracking-tight text-text">
          {title}
        </div>
        {description && (
          <p className="mt-1 max-w-[460px] text-[13px] leading-relaxed text-text-dim">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
