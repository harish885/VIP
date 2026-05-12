'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

const STEPS = [
  { n: 1, label: 'Numbers',     sub: 'Quantitative inputs' },
  { n: 2, label: 'Strategy',    sub: 'Qualitative 1–5' },
  { n: 3, label: 'Context',     sub: 'Where you sit' },
  { n: 4, label: 'Review',      sub: 'Confirm + submit' },
];

/**
 * Stepper — the 4-segment progress strip at the top of the diagnostic.
 * Pure presentation; the parent owns the current step.
 */
export function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="mb-10 flex items-center gap-2">
      {STEPS.map((s, i) => {
        const isDone   = s.n < current;
        const isActive = s.n === current;
        return (
          <div key={s.n} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[12px] font-bold transition-colors',
                isActive && 'border-gold bg-gold/[0.15] text-gold',
                isDone   && 'border-green/40 bg-green/[0.10] text-green',
                !isActive && !isDone && 'border-line bg-bg-2/50 text-text-faint',
              )}
            >
              {isDone ? <Check size={14} strokeWidth={2.5} /> : s.n}
            </div>
            <div className="hidden flex-col sm:flex">
              <span
                className={cn(
                  'font-mono text-[10px] font-bold uppercase tracking-eyebrow leading-tight',
                  isActive ? 'text-text' : 'text-text-faint',
                )}
              >
                {s.label}
              </span>
              <span className="font-mono text-[9.5px] leading-tight text-text-faint">
                {s.sub}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  'h-px flex-1 transition-colors',
                  isDone ? 'bg-green/40' : 'bg-line-faint',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
