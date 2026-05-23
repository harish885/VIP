'use client';

import type { ReactNode } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { Surface } from '@/components/vip-ui/surface';

interface Action {
  rank: number;
  title: string;
  detail: string;
  capital_impact?: string | null;
  v_uplift_pct: number;
  time_horizon_months: number;
}

interface Props {
  actions: Action[];
  combinedUpliftPct: number;
  /** Optional info slot per action rank. */
  actionInfo?: (rank: number) => ReactNode | null;
  emptyMessage?: string;
}

/**
 * StrategyBoard — recommendation output as a Top-3 priority list.
 *
 * Reads as a horizontal kanban on lg+ (one column per action) and as a
 * vertical stack on narrow viewports. The card content is intentionally
 * loose: a single bold ΔV chip, the title and description aligned left,
 * a thin meta footer with capital lever + time-to-impact.
 */
export function StrategyBoard({ actions, combinedUpliftPct, actionInfo, emptyMessage }: Props) {
  if (actions.length === 0) {
    return (
      <Surface tone="tinted" padding="md">
        <p className="text-[13px] text-text-dim">
          {emptyMessage ?? 'No priority actions surfaced for this profile.'}
        </p>
      </Surface>
    );
  }
  return (
    <Surface tone="raised" padding="md">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
            Strategy board
          </div>
          <h3 className="mt-0.5 font-serif text-[18px] font-medium tracking-tight text-text">
            Three moves to close the value gap
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-green/[0.10] px-2.5 py-1 font-mono text-[11px] font-semibold text-green">
          <TrendingUp size={11} />
          +{Math.max(0, Math.round(combinedUpliftPct))}% combined uplift
        </span>
      </header>
      <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {actions.slice(0, 3).map((a) => (
          <li
            key={a.rank}
            className="flex h-full flex-col gap-4 rounded-xl border border-line bg-bg-2/40 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold/40 bg-gold/[0.12] font-serif text-[16px] font-semibold text-gold">
                {a.rank}
              </span>
              <span className="shrink-0 rounded-md bg-green/[0.10] px-2 py-1 font-mono text-[12px] font-semibold text-green">
                +{a.v_uplift_pct.toFixed(1)}%
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-1.5">
                <h4 className="text-[15.5px] font-semibold leading-snug text-text">
                  {a.title}
                </h4>
                {actionInfo?.(a.rank)}
              </div>
              <p className="mt-1.5 text-[12.5px] leading-snug text-text-dim">
                {a.detail}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line-faint pt-3 font-mono text-[11px] text-text-faint">
              {a.capital_impact && (
                <span className="text-text-dim">{a.capital_impact}</span>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock size={11} /> ~{a.time_horizon_months} months
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Surface>
  );
}
