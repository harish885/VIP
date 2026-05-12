/**
 * Phase 06 — shared scoring types.
 *
 * Same shapes are consumed by:
 *   · the server-action scoring pipeline (lib/scoring/index.ts)
 *   · the dashboard view (Phase 07)
 *   · the client-side simulation engine (Phase 09 — re-uses valuation.ts)
 */
import type { DiagnosticInput } from '@/lib/diagnostic-schema';

export type CapitalKey = 'financial' | 'technological' | 'human' | 'relational';

export type RiskIndex = 'LOW' | 'MEDIUM' | 'HIGH';

export type FragilityFlag =
  | 'client_concentration'
  | 'founder_dependency'
  | 'low_digital'
  | 'over_leveraged';

/** Stage 1 — engineered metrics derived from raw inputs. */
export interface DerivedMetrics {
  // Quantitative (peer-comparable)
  revenue_cagr_2y_pct: number;
  ebitda_margin_pct: number;
  recurring_revenue_pct: number;
  top3_client_concentration_pct: number;
  client_concentration_inv: number;          // 100 − top3
  tech_investment_ratio_pct: number;

  // Qualitative 1–5 mapped to 0–100 (absolute, not peer)
  founder_independence_pct: number;
  management_score_pct: number;
  digital_maturity_pct: number;
  client_portfolio_quality_pct: number;
  business_scalability_pct: number;
  network_partnerships_pct: number;
}

/** Stage 2 — per-metric peer percentile rank (0–100). */
export interface PercentileRanks {
  revenue_cagr: number;
  ebitda_margin: number;
  recurring_revenue: number;
  client_concentration_inv: number;
  tech_investment: number;

  // Qualitative metrics are already 0–100 absolute → percentile = identity.
  founder_independence: number;
  management: number;
  digital_maturity: number;
  client_portfolio: number;
  scalability: number;
  network: number;
}

/** Stage 3 — within-capital weighted means of the percentile ranks. */
export interface CapitalScores {
  financial: number;
  technological: number;
  human: number;
  relational: number;
}

/** Stage 4 — composite Quality Score + SQF. */
export interface CompositeScores {
  cqs: number;   // 0–100
  sqf: number;   // 0.6–1.4
}

/** Stage 5 — Growth Factor. */
export interface GrowthFactor {
  gf_base: number;
  lifecycle_modifier: number;
  scalability_modifier: number;
  gf: number;    // 0.7–1.5
}

/** Stage 6 — valuation outputs. */
export interface ValuationOutputs {
  m_sector: number;
  v_current_eur: number;
  v_low_eur: number;
  v_high_eur: number;
  v_potential_eur: number;
  value_gap_pct: number;
}

/** Final output of the scoring pipeline — what gets written to vip.valuations. */
export interface ScoringResult {
  inputs: DiagnosticInput;
  metrics: DerivedMetrics;
  percentiles: PercentileRanks;
  capitals: CapitalScores;
  composite: CompositeScores;
  growth: GrowthFactor;
  valuation: ValuationOutputs;
  quality_score: number;        // round(cqs)
  scalability_index: number;
  risk_index: RiskIndex;
  flags: FragilityFlag[];
}
