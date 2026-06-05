'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
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

/** Per-element stagger (ms) for the formula walk. */
const STEP_MS = 110;

/**
 * ValueBridge — visual rendering of `V = EBITDA × Multiple × SQF × GF`.
 *
 * Four labelled stones with multiply glyphs between them, then a chunky
 * "= V" terminal. Each stone carries a SourceBadge so the reader sees
 * at a glance which inputs came from AIDA, which the entrepreneur
 * overrode, and which the engine computed.
 *
 * On first scroll-into-view the multiplication is walked once, left to
 * right — EBITDA, ×M, ×SQF, ×GF, then V settles with a brief gold
 * ring. Informative motion only; reduced-motion users get a plain
 * render (the global media query zeroes the transitions).
 */
export function ValueBridge({ ebitda, multiple, sqf, gf, result }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Desktop walk order: stone, glyph, stone, glyph, … result last.
  const seq = (i: number) => ({
    className: cn(
      'transition-all duration-500 [transition-timing-function:var(--ease-out)]',
      on ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
    ),
    style: { transitionDelay: `${i * STEP_MS}ms` },
  });

  return (
    <div ref={ref} className="space-y-3">
      {/* Desktop: single row with multiply glyphs between stones. */}
      <div className="hidden items-stretch gap-3 lg:flex">
        <Stone {...ebitda} {...seq(0)} />
        <Glyph {...seq(1)}><Multiply /></Glyph>
        <Stone {...multiple} {...seq(2)} />
        <Glyph {...seq(3)}><Multiply /></Glyph>
        <Stone {...sqf} {...seq(4)} />
        <Glyph {...seq(5)}><Multiply /></Glyph>
        <Stone {...gf} {...seq(6)} />
        <Glyph {...seq(7)}><span className="font-serif text-[20px] font-medium text-text-faint">=</span></Glyph>
        <ResultStone {...result} {...seq(8)} settled={on} settleDelayMs={8 * STEP_MS + 250} />
      </div>
      {/* Mobile + tablet: 2-column grid of stones, result spans full width. */}
      <div className="grid grid-cols-2 gap-3 lg:hidden">
        <Stone {...ebitda} {...seq(0)} />
        <Stone {...multiple} {...seq(1)} />
        <Stone {...sqf} {...seq(2)} />
        <Stone {...gf} {...seq(3)} />
        <div className="col-span-2">
          <ResultStone {...result} {...seq(4)} settled={on} settleDelayMs={4 * STEP_MS + 250} />
        </div>
      </div>
    </div>
  );
}

type SeqProps = { className?: string; style?: React.CSSProperties };

function Stone({ label, value, source, hint, info, className, style }: Step & SeqProps) {
  return (
    <div
      className={cn('flex flex-1 flex-col gap-1.5 rounded-lg border border-line bg-bg-1 px-4 py-3', className)}
      style={style}
    >
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

function ResultStone({
  value,
  sub,
  info,
  className,
  style,
  settled,
  settleDelayMs,
}: Props['result'] & SeqProps & { settled: boolean; settleDelayMs: number }) {
  return (
    <div
      className={cn(
        'flex flex-[1.3] flex-col justify-between gap-1.5 rounded-lg border border-gold/40 bg-gold/[0.08] px-5 py-3',
        settled && 'v-settle',
        className,
      )}
      style={{ ...style, animationDelay: `${settleDelayMs}ms` }}
    >
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

function Glyph({ children, className, style }: { children: ReactNode } & SeqProps) {
  return (
    <div className={cn('flex shrink-0 items-center justify-center px-1 text-text-faint', className)} style={style}>
      {children}
    </div>
  );
}
