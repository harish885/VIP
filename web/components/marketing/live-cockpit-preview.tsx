'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FlaskConical } from 'lucide-react';
import { StatusBadge } from '@/components/vip-ui/status-badge';
import { SourceBadge } from '@/components/vip-ui/source-badge';
import { cn } from '@/lib/cn';

/**
 * LiveCockpitPreview — the home-page cockpit that runs itself.
 *
 * Every few seconds it nudges one scenario lever and lets V recompute,
 * exactly like the real scenario lab. Numbers are the internally
 * consistent ACME demo profile (750K × 5.0 × SQF × GF), labelled as a
 * demo run. Proof, not promise.
 *
 * Calm rules: one lever at a time, ~5s cadence, pauses on hover and
 * under prefers-reduced-motion (where it renders the baseline, static).
 */

const EBITDA = 750_000;
const M_SECTOR = 5.0;
const V_BASE = EBITDA * M_SECTOR * 1.05 * 1.07; // ≈ €4.21M

// Each scenario: one lever moved from the company's actual position,
// with the SQF/GF the engine would land on.
const SCENARIOS = [
  { lever: 'Baseline — as filed',              from: null, to: null, sqf: 1.05, gf: 1.07 },
  { lever: 'Recurring revenue 25% → 40%',      from: 31,   to: 50,   sqf: 1.09, gf: 1.08 },
  { lever: 'Top-3 concentration 45% → 30%',    from: 56,   to: 38,   sqf: 1.12, gf: 1.08 },
  { lever: 'R&D / revenue 1.2% → 2.5%',        from: 12,   to: 25,   sqf: 1.13, gf: 1.10 },
] as const;

const KPI = [
  { label: 'Quality', value: '67/100', sub: 'Mid-cohort structure' },
  { label: 'Risk', value: 'MEDIUM', sub: 'Client concentration' },
] as const;

const ACTIONS = [
  ['01', 'Reduce top-3 client concentration', '+12% V', 'Relational capital'],
  ['02', 'Grow recurring revenue base', '+9% V', 'Financial capital'],
  ['03', 'Strengthen middle management', '+7% V', 'Human capital'],
] as const;

const CADENCE_MS = 5000;

function fmtM(eur: number): string {
  return `€${(eur / 1_000_000).toFixed(2)}M`;
}

export function LiveCockpitPreview() {
  const [idx, setIdx] = useState(0);
  const [shownV, setShownV] = useState(V_BASE);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Advance the scenario on a fixed cadence.
  useEffect(() => {
    if (paused || reduced) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % SCENARIOS.length), CADENCE_MS);
    return () => clearInterval(id);
  }, [paused, reduced]);

  // Count V toward the active scenario's target.
  const scenario = SCENARIOS[idx]!;
  const targetV = EBITDA * M_SECTOR * scenario.sqf * scenario.gf;
  useEffect(() => {
    if (reduced) {
      setShownV(targetV);
      return;
    }
    const fromV = shownV;
    const start = performance.now();
    const DUR = 900;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / DUR);
      const eased = 1 - Math.pow(1 - t, 3);
      setShownV(fromV + (targetV - fromV) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetV, reduced]);

  const deltaPct = ((targetV - V_BASE) / V_BASE) * 100;

  return (
    <aside
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="rounded-lg border border-line bg-bg-1 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">
            Decision cockpit
          </div>
          <h2 className="mt-1 font-serif text-[24px] font-medium leading-tight text-text">
            ACME Industrie S.R.L.
          </h2>
          <p className="mt-1 text-[12px] text-text-faint">NACE 282 · Manufacturing · Lombardia</p>
        </div>
        <StatusBadge tone="info">Demo run</StatusBadge>
      </div>

      {/* Headline V — recomputes as the demo moves a lever */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="col-span-2 rounded-md border border-gold/35 bg-gold/[0.06] px-3 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-gold">
                Enterprise value
              </div>
              <div className="mt-1 font-serif text-[30px] font-medium leading-none text-text">
                {fmtM(shownV)}
              </div>
            </div>
            <span
              className={cn(
                'rounded-md px-2 py-0.5 font-mono text-[11px] font-bold transition-colors',
                deltaPct > 0.05 ? 'bg-green/[0.10] text-green' : 'bg-bg-2 text-text-faint',
              )}
            >
              {deltaPct > 0.05 ? `+${deltaPct.toFixed(1)}%` : 'as filed'}
            </span>
          </div>
        </div>
        {KPI.map((item) => (
          <div key={item.label} className="rounded-md border border-line bg-bg-2/55 px-3 py-3">
            <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-text-faint">
              {item.label}
            </div>
            <div className="mt-1 font-serif text-[22px] font-medium leading-none text-text">
              {item.value}
            </div>
            <div className="mt-1 truncate text-[11px] text-text-faint">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Auto-playing scenario lever */}
      <div className="mt-4 rounded-md border border-line bg-bg-1 p-3">
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-faint">
            <FlaskConical size={11} className="text-purple" />
            Scenario lab
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-purple">
            <span className={cn('h-1.5 w-1.5 rounded-full bg-purple', !paused && !reduced && 'animate-pulse')} />
            {paused ? 'paused' : 'auto-demo'}
          </span>
        </div>
        <div className="font-mono text-[12px] text-text" aria-live="polite">{scenario.lever}</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-3">
          <div
            className="h-full rounded-full bg-gold transition-all duration-[900ms] [transition-timing-function:var(--ease-out)]"
            style={{ width: `${scenario.to ?? 31}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-text-faint">Same engine as the real cockpit.</span>
          <SourceBadge source="computed" />
        </div>
      </div>

      {/* Top actions */}
      <div className="mt-4 rounded-md border border-line bg-bg-1 p-3">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-faint">
          Top actions
        </div>
        <ol className="mt-2 divide-y divide-line-faint">
          {ACTIONS.map(([rank, title, uplift, capital]) => (
            <li key={rank} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 py-2">
              <span className="font-mono text-[11px] font-bold text-cyan">{rank}</span>
              <span className="min-w-0 truncate text-[13px] font-medium text-text">{title}</span>
              <span className="rounded-md bg-green/[0.08] px-2 py-0.5 font-mono text-[10px] font-bold text-green">
                {uplift}
              </span>
              <span className="col-start-2 text-[11px] text-text-faint">{capital}</span>
            </li>
          ))}
        </ol>
      </div>

      <Link
        href="/companies"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-text bg-text px-4 py-2.5 text-[13px] font-semibold text-bg-1 transition-colors hover:bg-text-dim"
      >
        Open company search <ArrowRight size={14} />
      </Link>
    </aside>
  );
}
