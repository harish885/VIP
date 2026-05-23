/**
 * Phase 06 · Stages 3 + 4 — within-capital aggregation and the composite CQS / SQF.
 *
 * Stage 3 collapses the per-metric percentile ranks into a single 0–100
 * score for each capital pillar via a weighted mean.
 *
 * Stage 4 fuses the four pillar scores into:
 *   · CQS — Composite Quality Score (0–100)
 *   · SQF — the multiplicative quality factor that scales V (0.6–1.4)
 *
 * Weights are externalised below so the calibration notebook can tweak them.
 */
import type {
  CapitalKey,
  CapitalScores,
  CompositeScores,
  PercentileRanks,
} from './types';

// =============================================================================
// Stage 3 — within-capital weighted means
// =============================================================================
export type Weight = { key: keyof PercentileRanks; weight: number };

/**
 * Per-capital weights. Every scored Likert in the questionnaire feeds
 * exactly one capital so the user can see their answers reflected in
 * the radar. Weights inside each capital sum to 1.0; if a metric is
 * NaN (question excluded) `weightedMean` drops it and renormalises
 * across the remaining weights.
 */
export const CAPITAL_WEIGHTS: Record<CapitalKey, Weight[]> = {
  financial: [
    { key: 'ebitda_margin',            weight: 0.30 },
    { key: 'revenue_cagr',             weight: 0.25 },
    { key: 'recurring_revenue',        weight: 0.15 },
    { key: 'client_concentration_inv', weight: 0.15 },
    { key: 'quality_of_growth',        weight: 0.15 },  // Q13
  ],
  technological: [
    { key: 'digital_maturity',         weight: 0.30 },  // Q1
    { key: 'tech_investment',          weight: 0.20 },
    { key: 'automation',               weight: 0.15 },  // Q2
    { key: 'enabling_systems',         weight: 0.15 },  // Q3
    { key: 'distinctive_tech_assets',  weight: 0.20 },  // Q4
  ],
  human: [
    { key: 'founder_independence',     weight: 0.25 },  // Q5
    { key: 'management',               weight: 0.20 },  // Q6
    { key: 'process_maturity',         weight: 0.15 },  // Q7
    { key: 'transferability',          weight: 0.10 },  // Q8
    { key: 'scalability',              weight: 0.15 },  // Q14
    { key: 'distinctive_assets_score', weight: 0.15 },  // Q18
  ],
  relational: [
    { key: 'client_portfolio',         weight: 0.25 },  // Q9
    { key: 'strategic_partnerships',   weight: 0.20 },  // Q10
    { key: 'reputation',               weight: 0.15 },  // Q11
    { key: 'network',                  weight: 0.20 },  // Q12
    { key: 'recurring_revenue',        weight: 0.10 },
    { key: 'ma_history',               weight: 0.10 },  // Q19
  ],
};

export function aggregateCapitals(percentiles: PercentileRanks): CapitalScores {
  return {
    financial:     weightedMean(percentiles, CAPITAL_WEIGHTS.financial),
    technological: weightedMean(percentiles, CAPITAL_WEIGHTS.technological),
    human:         weightedMean(percentiles, CAPITAL_WEIGHTS.human),
    relational:    weightedMean(percentiles, CAPITAL_WEIGHTS.relational),
  };
}

function weightedMean(p: PercentileRanks, ws: Weight[]): number {
  let num = 0;
  let den = 0;
  for (const { key, weight } of ws) {
    const v = p[key];
    if (typeof v !== 'number' || Number.isNaN(v)) continue;
    num += v * weight;
    den += weight;
  }
  if (den === 0) return 50;
  return roundUnit(num / den);
}

// =============================================================================
// Stage 4 — Composite Quality Score + SQF
// =============================================================================
//   CQS = 0.35·Fin + 0.20·Tech + 0.25·Human + 0.20·Rel
//   SQF = 0.6 + (CQS / 100) · 0.8        ∈ [0.6, 1.4]
// =============================================================================
export const COMPOSITE_WEIGHTS = {
  financial:     0.35,
  technological: 0.20,
  human:         0.25,
  relational:    0.20,
} as const;

export function composeScores(caps: CapitalScores): CompositeScores {
  const cqs =
    caps.financial     * COMPOSITE_WEIGHTS.financial +
    caps.technological * COMPOSITE_WEIGHTS.technological +
    caps.human         * COMPOSITE_WEIGHTS.human +
    caps.relational    * COMPOSITE_WEIGHTS.relational;

  const sqf = clamp(0.6 + (cqs / 100) * 0.8, 0.6, 1.4);

  return {
    cqs: roundUnit(cqs),
    sqf: round2(sqf),
  };
}

export function scalabilityIndex(caps: CapitalScores, percentiles: PercentileRanks): number {
  // A simple composite — average of capital weighted toward scalability drivers.
  return roundUnit(
    caps.human * 0.4 +
    percentiles.scalability * 0.4 +
    caps.technological * 0.2,
  );
}

// =============================================================================
// Helpers
// =============================================================================
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function roundUnit(n: number): number {
  return Math.round(n);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
