/**
 * Bridge between the new questionnaire-only `DiagnosticInput` and the
 * augmented `ScoringInput` consumed by the scoring engine.
 *
 * The pivot moved quantitative data into AIDA (per-company snapshot)
 * and removed it from the entrepreneur's form. The scoring engine still
 * needs revenue history, EBITDA, and three proxy ratios (recurring
 * revenue, top-3 concentration, tech investment / revenue) — those are
 * derived here either from the AIDA snapshot directly, or from
 * qualitative answers that proxy the unobservable ones.
 */
import { EXAMPLE_DIAGNOSTIC, type DiagnosticInput } from '@/lib/diagnostic-schema';
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
 * The combined scoring input. Includes every field the engine reads.
 * Field names match the legacy schema so existing scoring code keeps
 * compiling against `inputs.<field>`.
 */
export interface ScoringInput extends DiagnosticInput {
  // AIDA-derived quantitative fields
  revenue_y_1: number;
  revenue_y_2: number;
  revenue_y_3: number;
  ebitda: number;
  ebitda_margin_pct: number;

  // Proxy ratios (computed from Qs when AIDA does not carry them directly)
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
}

export function buildScoringInput({ diagnostic, snapshot }: BuildOptions): ScoringInput {
  // ---- Revenue history (k EUR in AIDA → EUR for scoring) -------------------
  const revLast = (snapshot.revenue_last_thk ?? snapshot.revenue_2024_thk ?? 0) * 1000;
  const rev2024 = (snapshot.revenue_2024_thk ?? snapshot.revenue_last_thk ?? 0) * 1000;
  const rev2023 = (snapshot.revenue_2023_thk ?? rev2024) * 1; // already k * 1000 below
  const rev2022 = (snapshot.revenue_2022_thk ?? snapshot.revenue_2023_thk ?? 0) * 1000;
  // Three-point series: revenue_y_1 = oldest, revenue_y_3 = newest.
  const revY1 = (snapshot.revenue_2022_thk ?? 0) * 1000 || rev2022 || revLast;
  const revY2 = (snapshot.revenue_2023_thk ?? 0) * 1000 || revLast;
  const revY3 = revLast || revY2 || revY1 || 0;

  const ebitda = (snapshot.ebitda_last_thk ?? snapshot.ebitda_2024_thk ?? 0) * 1000;
  const margin =
    snapshot.ebitda_margin_pct ?? (revY3 > 0 ? (ebitda / revY3) * 100 : 0);

  // ---- Proxies for unobservable ratios -------------------------------------
  // top-3 client concentration: Q9 client_portfolio_quality (1 = concentrated,
  // 5 = well diversified). Map 1 → 80%, 5 → 25%.
  const top3 = linMap(diagnostic.client_portfolio_quality, 1, 5, 80, 25);
  // recurring revenue: drives off Q9 + Q13 (quality_of_growth). Approx:
  // average × 10 + 10 → roughly 20% baseline, 60% if both top.
  const recurring = clamp(
    10 + ((diagnostic.client_portfolio_quality + diagnostic.q_quality_of_growth) / 2) * 10,
    0,
    100,
  );
  // tech investment ratio: prefer AIDA R&D / revenue; fall back to Q-driven proxy.
  const aidaRD = snapshot.rd_expense_thk !== null && revY3 > 0
    ? (snapshot.rd_expense_thk * 1000 / revY3) * 100
    : null;
  const techRatio = aidaRD ?? linMap(
    (diagnostic.digital_maturity + diagnostic.q_distinctive_tech_assets) / 2,
    1,
    5,
    0.3,
    6,
  );

  // ---- Lifecycle resolution -------------------------------------------------
  const lifecycle: ScoringInput['lifecycle_stage'] =
    diagnostic.lifecycle_stage ?? LIFECYCLE_FROM_SCORE[diagnostic.q_lifecycle_score - 1] ?? 'Maturity';

  const sector: ScoringSector =
    (diagnostic.sector as ScoringSector | undefined) ?? 'Manufacturing';

  // Avoid the unused-binding lint when k-conversions diverge.
  void rev2024; void rev2023; void rev2022;

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
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// =============================================================================
// Demo ScoringInput — ACME profile, used by the dashboard's demo fallback
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
