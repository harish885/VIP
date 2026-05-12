'use client';

/**
 * Phase 09 — Simulation Engine.
 *
 * Three sliders bound to the same three levers DEMO_LEVERS exposes:
 *   · Top-3 client concentration   (0–80%)
 *   · Recurring revenue share      (0–80%)
 *   · R&D / revenue                (0–10%)
 *
 * On any change we mutate a copy of the baseline DiagnosticInput, run the
 * shared scoring pipeline (synchronous when no Supabase client is passed —
 * synthetic priors only) and render the simulated V vs the current V.
 *
 * All math goes through `lib/scoring/valuation.ts`, the same module the
 * server-side scoring pipeline uses. There is no duplicated arithmetic.
 */
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Sliders } from 'lucide-react';
import type { DiagnosticInput } from '@/lib/diagnostic-schema';
import { runScoring, type ScoringResult } from '@/lib/scoring';

const LEVERS = [
  { key: 'concentration', label: 'Top-3 client concentration', min: 0, max: 80,  step: 1,   unit: '%', input: 'top3_client_concentration' },
  { key: 'recurring',     label: 'Recurring revenue share',    min: 0, max: 80,  step: 1,   unit: '%', input: 'recurring_revenue_pct'     },
  { key: 'rd_intensity',  label: 'R&D / revenue',              min: 0, max: 10,  step: 0.1, unit: '%', input: 'tech_investment_ratio_pct' },
] as const satisfies ReadonlyArray<{
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  input: keyof DiagnosticInput;
}>;

type LeverKey = (typeof LEVERS)[number]['key'];

export interface SimulationPanelProps {
  baseline: DiagnosticInput;
  /** V from the persisted/initial scoring result — the comparison anchor. */
  vCurrentEur: number;
  /** Sum of the persisted Top-3 ΔV% (so the "all levers at target" preview
   *  can land on the recommended V_potential when nothing's been touched). */
  vPotentialEur: number;
}

export function SimulationPanel({ baseline, vCurrentEur, vPotentialEur }: SimulationPanelProps) {
  const initial: Record<LeverKey, number> = useMemo(
    () => ({
      concentration: baseline.top3_client_concentration,
      recurring:     baseline.recurring_revenue_pct,
      rd_intensity:  baseline.tech_investment_ratio_pct,
    }),
    [baseline],
  );

  const [values, setValues] = useState<Record<LeverKey, number>>(initial);
  const [simulated, setSimulated] = useState<ScoringResult | null>(null);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recompute scoring whenever a slider moves, debounced 30ms.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const next: DiagnosticInput = {
        ...baseline,
        top3_client_concentration: values.concentration,
        recurring_revenue_pct:     values.recurring,
        tech_investment_ratio_pct: values.rd_intensity,
      };
      startTransition(async () => {
        const result = await runScoring(next, {});
        setSimulated(result);
      });
    }, 30);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [values, baseline]);

  const vSimEur = simulated?.valuation.v_current_eur ?? vCurrentEur;
  const dirty =
    values.concentration !== initial.concentration ||
    values.recurring !== initial.recurring ||
    values.rd_intensity !== initial.rd_intensity;

  const headlineEur = dirty ? vSimEur : vPotentialEur;
  const headlineLabel = dirty ? 'V simulated' : 'V potential (Top-3 actions)';
  const deltaPct = vCurrentEur > 0 ? ((headlineEur - vCurrentEur) / vCurrentEur) * 100 : 0;
  const deltaIsPositive = deltaPct >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-bg-2/60 to-purple/[0.06] p-6">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 80% 20%, rgba(168, 85, 247, 0.10), transparent 60%)',
        }}
      />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
            Simulation Engine
          </h4>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-purple/[0.15] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-purple">
            <Sliders size={10} /> {pending ? 'updating…' : 'live'}
          </span>
        </div>

        <p className="mb-4 text-[13px] leading-relaxed text-text-dim">
          Move a lever to see V recompute in real time. Math runs locally — no
          server call per slider tick.
        </p>

        <div className="space-y-4">
          {LEVERS.map((l) => {
            const v = values[l.key];
            const display =
              l.step < 1 ? v.toFixed(1) : String(Math.round(v));
            const ratio = (v - l.min) / (l.max - l.min);
            return (
              <div key={l.key} className="rounded-lg border border-line bg-black/20 p-3">
                <div className="mb-1.5 flex items-baseline justify-between font-mono text-[11px]">
                  <span className="text-text">{l.label}</span>
                  <span className="font-mono text-[13px] font-bold text-amber">
                    {display}
                    {l.unit}
                  </span>
                </div>
                <input
                  type="range"
                  className="vip-range w-full"
                  min={l.min}
                  max={l.max}
                  step={l.step}
                  value={v}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [l.key]: Number(e.target.value) }))
                  }
                  style={
                    {
                      // CSS var consumed by the .vip-range styles for fill colour.
                      '--ratio': `${Math.round(ratio * 100)}%`,
                    } as React.CSSProperties
                  }
                />
                <div className="mt-1 flex justify-between font-mono text-[10px] text-text-faint">
                  <span>{l.min}{l.unit}</span>
                  <span>{l.max}{l.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 rounded-lg border border-purple/25 bg-purple/[0.08] px-4 py-3">
          <SimStat label="V current"        eur={vCurrentEur} tone="text" />
          <SimStat label={headlineLabel}   eur={headlineEur} tone="green" big />
          <SimStat
            label="Δ vs current"
            eur={null}
            valueLabel={`${deltaIsPositive ? '+' : ''}${deltaPct.toFixed(1)}%`}
            tone={deltaIsPositive ? 'green' : 'amber'}
          />
        </div>

        {dirty && (
          <button
            type="button"
            className="mt-3 font-mono text-[10.5px] uppercase tracking-eyebrow text-text-faint underline-offset-2 hover:text-text-dim hover:underline"
            onClick={() => setValues(initial)}
          >
            Reset to current values
          </button>
        )}
      </div>
    </div>
  );
}

function SimStat({
  label,
  eur,
  valueLabel,
  tone,
  big,
}: {
  label: string;
  eur: number | null;
  valueLabel?: string;
  tone: 'text' | 'green' | 'amber';
  big?: boolean;
}) {
  const value =
    valueLabel ??
    (typeof eur === 'number' ? `€${(eur / 1_000_000).toFixed(1)}M` : '—');
  const color =
    tone === 'green'
      ? 'text-green'
      : tone === 'amber'
        ? 'text-amber'
        : 'text-text';
  return (
    <div>
      <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-purple">
        {label}
      </div>
      <div className={`mt-0.5 font-mono ${big ? 'text-[22px]' : 'text-[18px]'} font-bold ${color}`}>
        {value}
      </div>
    </div>
  );
}
