'use client';

import { cn } from '@/lib/cn';

/**
 * RatingDots — interactive 1–5 selector with labelled endpoints.
 *
 * Designed to feel tactile: 5 buttons in a row, the selected one scales
 * slightly and glows purple. Each button is a real <button> so keyboard
 * focus + Enter/Space work for free.
 */
export function RatingDots({
  value,
  onChange,
  lowLabel = 'Low',
  highLabel = 'High',
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const isSelected = n === value;
          const isInRange = n <= value;
          return (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => onChange(n)}
              aria-label={`Rate ${n} out of 5`}
              aria-pressed={isSelected}
              className={cn(
                'group relative h-8 w-8 shrink-0 rounded-full border transition-all duration-200',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isSelected && 'scale-110 border-purple bg-purple text-bg shadow-[0_0_14px_rgba(168,85,247,0.55)]',
                !isSelected && isInRange && 'border-purple/60 bg-purple/[0.20]',
                !isInRange && 'border-line bg-text/[0.03] hover:border-line-2 hover:bg-text/[0.06]',
              )}
            >
              <span
                className={cn(
                  'font-mono text-[11px] font-bold',
                  isSelected && 'text-bg',
                  !isSelected && isInRange && 'text-purple',
                  !isInRange && 'text-text-faint',
                )}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex w-full justify-between px-1 font-mono text-[9.5px] uppercase tracking-eyebrow text-text-faint">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
