/**
 * Phase 06 · Stage 1 — Metric Engineering.
 *
 * Turn the raw diagnostic submission into the metrics the downstream
 * stages consume. Two flavours:
 *
 *   · Quantitative metrics  — peer-comparable, ranked against AIDA peers
 *     in Stage 2 (revenue CAGR, EBITDA margin, recurring revenue,
 *     client concentration, tech investment ratio). Always defined —
 *     they come from the AIDA snapshot or the entrepreneur's overrides.
 *
 *   · Qualitative metrics   — 1-5 self-assessments mapped to 0-100 here.
 *     The entrepreneur can mark a question "not relevant" → the value
 *     is null in the input and we emit NaN. Stage 3 `weightedMean`
 *     drops NaN entries and renormalises the remaining weights, so
 *     excluded questions disappear from the within-capital aggregation
 *     without distorting the others.
 *
 * Every Likert in `DiagnosticInput` flows into a metric here, so every
 * answered question is reflected in the final scores.
 */
import type { ScoringInput } from './company-input';
import type { DerivedMetrics } from './types';

export function deriveMetrics(input: ScoringInput): DerivedMetrics {
  const excluded = new Set(input.excluded_questions ?? []);
  const cagr = computeCagr2y(input.revenue_y_1, input.revenue_y_3);
  const margin = computeEbitdaMargin(input.ebitda, input.revenue_y_3);

  return {
    revenue_cagr_2y_pct: round1(cagr),
    ebitda_margin_pct: round1(margin),
    recurring_revenue_pct: round1(input.recurring_revenue_pct),
    top3_client_concentration_pct: round1(input.top3_client_concentration),
    client_concentration_inv: round1(100 - input.top3_client_concentration),
    tech_investment_ratio_pct: round1(input.tech_investment_ratio_pct),

    // Q1–Q14 + Q17–Q19 qualitative inputs. NaN when null or excluded.
    digital_maturity_pct:           qualPct(input.digital_maturity,          excluded.has('digital_maturity')),
    automation_pct:                 qualPct(input.q_automation,              excluded.has('q_automation')),
    enabling_systems_pct:           qualPct(input.q_enabling_systems,        excluded.has('q_enabling_systems')),
    distinctive_tech_assets_pct:    qualPct(input.q_distinctive_tech_assets, excluded.has('q_distinctive_tech_assets')),
    founder_independence_pct:       qualPct(input.founder_dependency,        excluded.has('founder_dependency')),
    management_score_pct:           qualPct(input.management_structure,      excluded.has('management_structure')),
    process_maturity_pct:           qualPct(input.q_process_maturity,        excluded.has('q_process_maturity')),
    transferability_pct:            qualPct(input.q_transferability,         excluded.has('q_transferability')),
    client_portfolio_quality_pct:   qualPct(input.client_portfolio_quality,  excluded.has('client_portfolio_quality')),
    strategic_partnerships_pct:     qualPct(input.q_strategic_partnerships,  excluded.has('q_strategic_partnerships')),
    reputation_pct:                 qualPct(input.q_reputation,              excluded.has('q_reputation')),
    network_partnerships_pct:       qualPct(input.network_partnerships,      excluded.has('network_partnerships')),
    quality_of_growth_pct:          qualPct(input.q_quality_of_growth,       excluded.has('q_quality_of_growth')),
    business_scalability_pct:       qualPct(input.business_scalability,      excluded.has('business_scalability')),
    distinctive_assets_score_pct:   qualPct(input.q_distinctive_assets_score, excluded.has('q_distinctive_assets_score')),
    ma_history_pct:                 qualPct(input.q_ma_history,              excluded.has('q_ma_history')),
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
 * Map a 1–5 Likert response to a 0–100 score. Returns NaN if the
 * question was unanswered or explicitly excluded.
 *
 *   raw 1 → 15   raw 2 → 60   raw 3 → 65   raw 4 → 82   raw 5 → 95
 */
const LIKERT_TO_PCT: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 15,
  2: 60,
  3: 65,
  4: 82,
  5: 95,
};

function qualPct(value: number | null | undefined, excluded: boolean): number {
  if (excluded) return Number.NaN;
  if (value == null || Number.isNaN(value)) return Number.NaN;
  const v = clamp(Math.round(value), 1, 5) as 1 | 2 | 3 | 4 | 5;
  return LIKERT_TO_PCT[v];
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
