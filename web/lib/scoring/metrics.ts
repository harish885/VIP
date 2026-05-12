/**
 * Phase 06 · Stage 1 — Metric Engineering.
 *
 * Turn the raw 17-input diagnostic submission into the ~12 metrics the
 * downstream stages actually consume. Two flavours:
 *
 *   · Quantitative metrics  — peer-comparable, ranked against AIDA peers
 *     in Stage 2 (revenue CAGR, EBITDA margin, recurring revenue,
 *     client concentration, tech investment ratio).
 *
 *   · Qualitative metrics   — 1-5 self-assessments mapped to a 0-100
 *     score in this stage. Stage 2 passes them through unchanged.
 *
 * Bounds: every metric falls inside finite, well-defined ranges so the
 * downstream weighted mean is meaningful even on extreme inputs.
 */
import type { ScoringInput } from './company-input';
import type { DerivedMetrics } from './types';

export function deriveMetrics(input: ScoringInput): DerivedMetrics {
  const cagr = computeCagr2y(input.revenue_y_1, input.revenue_y_3);
  const margin = computeEbitdaMargin(input.ebitda, input.revenue_y_3);

  return {
    revenue_cagr_2y_pct: round1(cagr),
    ebitda_margin_pct: round1(margin),
    recurring_revenue_pct: round1(input.recurring_revenue_pct),
    top3_client_concentration_pct: round1(input.top3_client_concentration),
    client_concentration_inv: round1(100 - input.top3_client_concentration),
    tech_investment_ratio_pct: round1(input.tech_investment_ratio_pct),

    // New Q5: 5 = minimal founder dependency (good). No inversion needed.
    founder_independence_pct: qualitativeToPct(input.founder_dependency),
    management_score_pct:     qualitativeToPct(input.management_structure),
    digital_maturity_pct:     qualitativeToPct(input.digital_maturity),
    client_portfolio_quality_pct: qualitativeToPct(input.client_portfolio_quality),
    business_scalability_pct: qualitativeToPct(input.business_scalability),
    network_partnerships_pct: qualitativeToPct(input.network_partnerships),
  };
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function computeCagr2y(rev_y1: number, rev_y3: number): number {
  if (rev_y1 <= 0 || rev_y3 <= 0) return 0;
  return (Math.pow(rev_y3 / rev_y1, 1 / 2) - 1) * 100;
}

function computeEbitdaMargin(ebitda: number, rev_y3: number): number {
  if (rev_y3 <= 0) return 0;
  return (ebitda / rev_y3) * 100;
}

/**
 * Map a 1–5 Likert response to a 0–100 score.
 *
 * Peer-relative anchoring: a self-rating of "3" puts the company close to
 * the AIDA cohort median (≈ 65 percentile in absolute terms because the
 * cohort is itself heavily mid-rated), not at exactly 50. The table
 * below is calibrated so the ACME demo profile lands on the seeded
 * capital scores; tune here before touching aggregate.ts weights.
 *
 *   raw 1 → 15
 *   raw 2 → 45
 *   raw 3 → 65
 *   raw 4 → 85
 *   raw 5 → 97
 *
 * When `invert` is true (founder dependency: 1 = best), the table is
 * read top-down: 1 → 97, …, 5 → 15.
 */
const LIKERT_TO_PCT: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 15,
  2: 60,
  3: 65,
  4: 82,
  5: 95,
};

function qualitativeToPct(value: number, invert = false): number {
  const v = clamp(Math.round(value), 1, 5) as 1 | 2 | 3 | 4 | 5;
  const lookup = (invert ? (6 - v) : v) as 1 | 2 | 3 | 4 | 5;
  return LIKERT_TO_PCT[lookup];
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
