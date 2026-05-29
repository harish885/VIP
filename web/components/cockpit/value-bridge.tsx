'use client';

import type { ReactNode } from 'react';
import { Multiply } from './glyphs';
import { SourceBadge, type ValueSource } from '@/components/vip-ui/source-badge';
import { cn } from '@/lib/cn';

interface Step {
  label: string;
  value: string;
  /** Visible source provenance — AIDA, override, computed. */
  source: ValueSource;
  /** Optional sub-line shown under the value. */
  hint?: string;
  /** Optional info-button slot. */
  info?: ReactNode;
}

interface Props {
  ebitda: Step;
  multiple: Step;
  sqf: Step;
  gf: Step;
  result: { value: string; sub?: string; info?: ReactNode };
}

/**
 * ValueBridge — visual rendering of `V = EBITDA × Multiple × SQF × GF`.
 *
 * Four labelled stones with multiply glyphs between them, then a chunky
 * "= V" terminal. Each stone carries a SourceBadge so the reader sees
 * at a glance which inputs came from AIDA, which the entrepreneur
 * overrode, and which the engine computed.
 */
export function ValueBridge({ ebitda, multiple, sqf, gf, result }: Props) {
  return (
    <div className="space-y-3">
      {/* Desktop: single row with multiply glyphs between stones. */}
      <div className="hidden items-stretch gap-3 lg:flex">
        <Stone {...ebitda} />
        <Glyph><Multiply /></Glyph>
        <Stone {...multiple} />
        <Glyph><Multiply /></Glyph>
        <Stone {...sqf} />
        <Glyph><Multiply /></Glyph>
        <Stone {...gf} />
        <Glyph><span className="font-serif text-[20px] font-medium text-text-faint">=</span></Glyph>
        <ResultStone {...result} />
      </div>
      {/* Mobile + tablet: 2-column grid of stones, result spans full width. */}
      <div className="grid grid-cols-2 gap-3 lg:hidden">
        <Stone {...ebitda} />
        <Stone {...multiple} />
        <Stone {...sqf} />
        <Stone {...gf} />
        <div className="col-span-2">
          <ResultStone {...result} />
        </div>
      </div>
    </div>
  );
}

function Stone({ label, value, source, hint, info }: Step) {
  return (
    <div className="flex flex-1 flex-col gap-1.5 rounded-lg border border-line bg-bg-1 px-4 py-3">
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
        <span>{label}</span>
        {info}
      </div>
      <div className="font-serif text-[20px] font-medium leading-none tracking-tight text-text">
        {value}
      </div>
      <div className="flex items-center gap-2">
        <SourceBadge source={source} />
        {hint && <span className="text-[11px] text-text-faint">{hint}</span>}
      </div>
    </div>
  );
}

function ResultStone({ value, sub, info }: Props['result']) {
  return (
    <div className={cn(
      'flex flex-[1.3] flex-col justify-between gap-1.5 rounded-lg border border-gold/40 bg-gold/[0.08] px-5 py-3',
    )}>
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-gold">
        <span>Enterprise value</span>
        {info}
      </div>
      <div className="font-serif text-[28px] font-medium leading-none tracking-tight text-text">
        {value}
      </div>
      {sub && <div className="text-[11.5px] text-text-faint">{sub}</div>}
    </div>
  );
}

function Glyph({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center justify-center px-1 text-text-faint">
      {children}
    </div>
  );
}
