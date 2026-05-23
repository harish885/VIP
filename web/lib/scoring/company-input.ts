/**
 * Bridge between the questionnaire-only `DiagnosticInput` and the augmented
 * `ScoringInput` consumed by the scoring engine.
 *
 * Two paths converge here:
 *
 *   1. AIDA-only path. Revenue history + EBITDA come from the AIDA
 *      snapshot, and the missing ratios (recurring revenue, top-3 client
 *      concentration, tech-investment / revenue) are proxied from
 *      qualitative answers.
 *
 *   2. Override path. If the entrepreneur enters their own financial
 *      values, those win over both AIDA and the qualitative proxies.
 *      Whatever they leave blank still falls back to AIDA / proxy.
 *
 * Either way the engine sees one fully-populated `ScoringInput`. The
 * server action records which path was taken on the submission row so
 * the valuation is reproducible.
 */
import {
  EXAMPLE_DIAGNOSTIC,
  type DiagnosticInput,
  type OverridesInput,
} from '@/lib/diagnostic-schema';
import type { AidaSnapshot } from '@/lib/aida';

/** Lifecycle modifier names — used by valuation.ts Growth Factor. */
export const LIFECYCLE_FROM_SCORE = ['Decline', 'Decline', 'Maturity', 'Growth', 'Growth'] as const;

/** Sector buckets supported by the engine. */
export type ScoringSector =
  | 'Manufacturing'
  | 'Wholesale & Distribution'
  | 'Professional Services'
  | 'Tech / Software'
  | 'Retail / e-Commerce'
  | 'Construction'
  | 'Logistics'
  | 'Other';

/**
 * The combined scoring input. Field names match the legacy schema so
 * existing scoring code keeps compiling against `inputs.<field>`.
 *
 * Likert fields stay nullable (inherited from `DiagnosticInput`) because
 * the entrepreneur may have marked any of them "not relevant".
 */
export interface ScoringInput extends DiagnosticInput {
  // AIDA / override-derived quantitative fields
  revenue_y_1: number;
  revenue_y_2: number;
  revenue_y_3: number;
  ebitda: number;
  ebitda_margin_pct: number;

  // Proxy ratios (computed from overrides → AIDA → Q answers in that order)
  recurring_revenue_pct: number;
  top3_client_concentration: number;
  tech_investment_ratio_pct: number;

  // Required by valuation.ts; mapped from q_lifecycle_score when missing
  lifecycle_stage: 'Early' | 'Growth' | 'Maturity' | 'Decline';
  sector: ScoringSector;
}

// =============================================================================
// Build the ScoringInput
// =============================================================================
export interface BuildOptions {
  diagnostic: DiagnosticInput;
  snapshot: AidaSnapshot;
  /** Optional financial overrides; only consumed when `overrides.enabled`. */
  overrides?: OverridesInput | null;
}

/** Treat `null`/`undefined` as "user didn't fill this field". */
function num(v: number | null | undefined): number | null {
  if (v == null) return null;
  if (typeof v !== 'number' || Number.isNaN(v)) return null;
  return v;
}

export function buildScoringInput({ diagnostic, snapshot, overrides }: BuildOptions): ScoringInput {
  const o = overrides && overrides.enabled ? overrides : null;
  const excluded = new Set(diagnostic.excluded_questions ?? []);

  // ---- Revenue history (k EUR in AIDA → EUR) ------------------------------
  const revLastAida = thkToEur(snapshot.revenue_last_thk);
  const rev2024Aida = thkToEur(snapshot.revenue_2024_thk) || revLastAida;
  const rev2023Aida = thkToEur(snapshot.revenue_2023_thk) || rev2024Aida;
  const rev2022Aida = thkToEur(snapshot.revenue_2022_thk) || rev2023Aida;
  const aidaY3 = revLastAida || rev2024Aida || rev2023Aida || rev2022Aida;
  const aidaY2 = rev2023Aida || aidaY3;
  const aidaY1 = rev2022Aida || aidaY2;

  const revY3 = num(o?.revenue_y_3) ?? aidaY3;
  const revY2 = num(o?.revenue_y_2) ?? aidaY2;
  const revY1 = num(o?.revenue_y_1) ?? aidaY1;

  const aidaEbitda =
    thkToEur(snapshot.ebitda_last_thk) || thkToEur(snapshot.ebitda_2024_thk);
  const ebitda = num(o?.ebitda) ?? aidaEbitda;

  const margin =
    revY3 > 0 ? (ebitda / revY3) * 100 : (snapshot.ebitda_margin_pct ?? 0);

  // ---- Proxies: overrides → AIDA → Q answers -----------------------------
  const cpq = excluded.has('client_portfolio_quality') ? null : num(diagnostic.client_portfolio_quality);
  const qog = excluded.has('q_quality_of_growth')       ? null : num(diagnostic.q_quality_of_growth);
  const dm  = excluded.has('digital_maturity')          ? null : num(diagnostic.digital_maturity);
  const qdta = excluded.has('q_distinctive_tech_assets') ? null : num(diagnostic.q_distinctive_tech_assets);

  // top-3 client concentration
  let top3: number;
  if (num(o?.top3_client_concentration) != null) top3 = num(o!.top3_client_concentration)!;
  else if (cpq != null) top3 = linMap(cpq, 1, 5, 80, 25);
  else top3 = 50; // neutral mid-cohort when Q9 excluded and no override

  // recurring revenue share
  let recurring: number;
  if (num(o?.recurring_revenue_pct) != null) recurring = num(o!.recurring_revenue_pct)!;
  else if (cpq != null && qog != null) recurring = clamp(10 + ((cpq + qog) / 2) * 10, 0, 100);
  else if (cpq != null)                 recurring = clamp(10 + cpq * 10, 0, 100);
  else if (qog != null)                 recurring = clamp(10 + qog * 10, 0, 100);
  else                                  recurring = 30;

  // tech investment ratio (R&D / revenue %)
  const aidaRD = snapshot.rd_expense_thk != null && revY3 > 0
    ? (snapshot.rd_expense_thk * 1000 / revY3) * 100
    : null;
  let techRatio: number;
  if (num(o?.tech_investment_ratio_pct) != null) techRatio = num(o!.tech_investment_ratio_pct)!;
  else if (aidaRD != null) techRatio = aidaRD;
  else if (dm != null && qdta != null) techRatio = linMap((dm + qdta) / 2, 1, 5, 0.3, 6);
  else if (dm != null)                 techRatio = linMap(dm, 1, 5, 0.3, 6);
  else if (qdta != null)               techRatio = linMap(qdta, 1, 5, 0.3, 6);
  else                                 techRatio = 1.0;

  // ---- Lifecycle resolution ----------------------------------------------
  const qlife = excluded.has('q_lifecycle_score') ? null : num(diagnostic.q_lifecycle_score);
  const fromScore: ScoringInput['lifecycle_stage'] | undefined =
    qlife != null ? LIFECYCLE_FROM_SCORE[qlife - 1] : undefined;
  const lifecycle: ScoringInput['lifecycle_stage'] =
    diagnostic.lifecycle_stage ?? fromScore ?? 'Maturity';

  const sector: ScoringSector =
    (diagnostic.sector as ScoringSector | undefined) ?? 'Manufacturing';

  return {
    ...diagnostic,
    revenue_y_1: revY1,
    revenue_y_2: revY2,
    revenue_y_3: revY3,
    ebitda,
    ebitda_margin_pct: round1(margin),
    recurring_revenue_pct: round1(recurring),
    top3_client_concentration: round1(top3),
    tech_investment_ratio_pct: round1(techRatio),
    lifecycle_stage: lifecycle,
    sector,
  };
}

// =============================================================================
// Helpers
// =============================================================================
function linMap(x: number, x0: number, x1: number, y0: number, y1: number): number {
  const t = (clamp(x, x0, x1) - x0) / (x1 - x0);
  return y0 + t * (y1 - y0);
}
function thkToEur(n: number | null | undefined): number {
  return n == null ? 0 : n * 1000;
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// =============================================================================
// Demo ScoringInput — ACME profile, used by the dashboard demo fallback
// and the simulation panel when no real submission exists yet.
// =============================================================================
export const DEMO_SCORING_INPUT: ScoringInput = {
  ...EXAMPLE_DIAGNOSTIC,
  revenue_y_1: 6_200_000,
  revenue_y_2: 7_100_000,
  revenue_y_3: 8_400_000,
  ebitda: 750_000,
  ebitda_margin_pct: 8.9,
  recurring_revenue_pct: 18,
  top3_client_concentration: 60,
  tech_investment_ratio_pct: 1.2,
  lifecycle_stage: 'Maturity',
  sector: 'Manufacturing',
};
