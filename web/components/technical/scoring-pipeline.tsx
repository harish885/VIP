'use client';

import { useReveal } from '@/lib/use-reveal';
import { SceneHeader } from '@/components/marketing/scene-header';

interface Stage {
  n: number;
  name: string;
  file: string;
  io: { in: string; out: string };
  body: string;
  formulas: string[];
}

const STAGES: Stage[] = [
  {
    n: 1,
    name: 'Derive metrics',
    file: 'lib/scoring/metrics.ts',
    io: {
      in:  'ScoringInput (17 fields)',
      out: 'DerivedMetrics (12 numerics)',
    },
    body:
      'Compress raw inputs into the 12 metrics the engine actually compares against peers. Likert 1–5 answers map through a non-linear table LIKERT_TO_PCT = [1→15, 2→60, 3→65, 4→82, 5→95] so the 3↔4 break aligns with peer-cohort median.',
    formulas: [
      'revenue_cagr_2y_pct  = (revenue_y_3 / revenue_y_1) ^ (1/2) − 1',
      'ebitda_margin_pct    = EBITDA / revenue_y_3 × 100',
      'founder_independence_pct = LIKERT_TO_PCT[input.founder_dependency]',
      '// + management, digital_maturity, client_portfolio, scalability, network',
    ],
  },
  {
    n: 2,
    name: 'Peer-relative percentile',
    file: 'lib/scoring/benchmarks.ts',
    io: {
      in:  'DerivedMetrics + peer_group_name + nace_prefix',
      out: 'PercentileRanks (0–100 each)',
    },
    body:
      'Three-tier lookup. (1) RPC percentile_in_peer_group within the explicit peer cohort. (2) RPC over a NACE-2 prefix. (3) Hard-coded synthetic prior — keeps the engine usable for local eval without Postgres. Higher-is-better flag flips ranking for metrics like client concentration.',
    formulas: [
      'pct = supabase.rpc(\'percentile_in_peer_group\', {…})',
      '   ?? supabase.rpc(\'percentile_in_nace_prefix\', {…})',
      '   ?? syntheticPrior(metric, value);',
    ],
  },
  {
    n: 3,
    name: 'Within-capital weighted mean',
    file: 'lib/scoring/aggregate.ts',
    io: {
      in:  'PercentileRanks',
      out: 'CapitalScores (4 × 0–100)',
    },
    body:
      'Each capital collapses to one score via a fixed weight vector. Weights live in CAPITAL_WEIGHTS — externalised so the calibration notebook can tune them without code changes.',
    formulas: [
      'financial     = 0.30·ebitda_margin + 0.25·revenue_cagr + 0.20·recurring_revenue + 0.25·client_concentration_inv',
      'technological = 0.55·digital_maturity + 0.45·tech_investment',
      'human         = 0.40·founder_independence + 0.35·management + 0.25·scalability',
      'relational    = 0.40·client_portfolio + 0.30·network + 0.30·recurring_revenue',
    ],
  },
  {
    n: 4,
    name: 'Composite CQS + SQF',
    file: 'lib/scoring/aggregate.ts',
    io: {
      in:  'CapitalScores',
      out: '{ cqs: 0–100, sqf: 0.6–1.4 }',
    },
    body:
      'Composite Quality Score is the cross-capital weighted mean. SQF is a smooth multiplicative factor that the final V multiplies by — clamped so a perfect / zero CQS doesn\'t blow the valuation up.',
    formulas: [
      'CQS = 0.35·Fin + 0.20·Tech + 0.25·Human + 0.20·Rel',
      'SQF = clamp(0.6 + (CQS / 100) × 0.8, 0.6, 1.4)',
    ],
  },
  {
    n: 5,
    name: 'Growth Factor',
    file: 'lib/scoring/valuation.ts',
    io: {
      in:  '{ revenue_cagr_2y_pct, lifecycle_stage, business_scalability }',
      out: 'GrowthFactor { gf_base, lifecycle_modifier, scalability_modifier, gf }',
    },
    body:
      'GF is a separate growth multiplier so V responds to lifecycle independently of quality. Lifecycle modifiers come from market expectations of multiple expansion. Scalability nudges via the Q15 answer.',
    formulas: [
      'gf_base   = 1.0 + clamp(cagr/100, −0.3, 0.5) × 0.4',
      'lifecycle = { Early:1.10, Growth:1.15, Maturity:1.00, Decline:0.90 }[stage]',
      'scal_mod  = 0.92 + (clamp(business_scalability, 1, 5) − 1) × 0.03',
      'GF        = clamp(gf_base × lifecycle × scal_mod, 0.7, 1.5)',
    ],
  },
  {
    n: 6,
    name: 'Final V',
    file: 'lib/scoring/valuation.ts',
    io: {
      in:  '{ ebitda, m_sector, sqf, gf, top3_uplift_pct_sum }',
      out: 'ValuationOutputs { v_current, v_low, v_high, v_potential, value_gap_pct }',
    },
    body:
      'M_sector is a separate function — see sector-multiples.ts. It looks up the base EBITDA multiple by NACE-3, NACE-2 prefix, then sector label, then default 5.8×. Every result × 0.75 illiquidity discount.',
    formulas: [
      'V        = EBITDA × M_sector × SQF × GF',
      'V_low    = V × 0.90',
      'V_high   = V × 1.12',
      'V_pot    = V × (1 + Σ top3_uplift_pct / 100)',
      'gap_pct  = (V_pot − V) / V × 100',
    ],
  },
];

export function ScoringPipelineSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="scoring" className="relative mx-auto max-w-[1240px] px-8 py-28">
      <SceneHeader
        eyebrow="Scoring engine"
        title="Six stages, pure functions."
        accent="pure functions."
        lead="Same module powers the server-side first compute and the client-side simulation re-runner. No hidden state. Stage 2 is the only one that reaches the database — and even it falls back to a synthetic prior."
      />

      <div ref={ref} className="reveal space-y-4">
        {STAGES.map((s) => (
          <article
            key={s.n}
            data-i={s.n - 1}
            className="grid grid-cols-1 gap-6 rounded-2xl border border-line bg-bg-1/80 p-7 backdrop-blur-sm lg:grid-cols-[120px_1fr_minmax(360px,520px)]"
          >
            <div>
              <div
                className="font-serif font-medium leading-none tracking-tight text-gold"
                style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)' }}
              >
                {s.n}
              </div>
              <div className="mt-2 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-gold">
                Stage
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-serif text-[20px] font-medium tracking-tight text-text">
                  {s.name}
                </h3>
                <span className="font-mono text-[10.5px] text-text-faint">{s.file}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[10.5px]">
                <span className="rounded-md bg-cyan/[0.10] px-2 py-0.5 font-mono font-semibold text-cyan">
                  in&nbsp;&nbsp;{s.io.in}
                </span>
                <span className="rounded-md bg-gold/[0.10] px-2 py-0.5 font-mono font-semibold text-gold">
                  out&nbsp;{s.io.out}
                </span>
              </div>

              <p className="mt-4 text-[13.5px] leading-relaxed text-text-dim">{s.body}</p>
            </div>

            <pre className="overflow-x-auto rounded-lg bg-bg-2/70 px-4 py-3 font-mono text-[11.5px] leading-[1.7] text-text">
              <code>{s.formulas.join('\n')}</code>
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}
