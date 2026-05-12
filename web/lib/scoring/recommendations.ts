/**
 * Phase 08 — Recommendation engine.
 *
 * Given a `ScoringResult`, return the Top-3 actions ranked by ROV:
 *
 *   ΔV%       = predicted percentage change in V if the action is applied,
 *               computed via the SAME `computeValuation` math used by the
 *               scoring pipeline (so the dashboard's V_potential is fully
 *               consistent with the recommendations panel).
 *
 *   ROV_score = ΔV% / (effort × months) × objective_weight
 *
 * The top three are then ranked and re-sorted 1..3 by ΔV%.
 */
import type { ScoringResult, CapitalKey } from './types';
import type { StatedObjective } from '@/lib/diagnostic-schema';
import { computeValuation } from './valuation';
import { getSectorMultiple } from './sector-multiples';
import { ACTION_CATALOGUE, type ActionCatalogueEntry } from './action-catalogue';

export interface RecommendationOutput {
  id: string;
  rank: 1 | 2 | 3;
  title: string;
  description: string;
  capital_key: CapitalKey;
  capital_impact: string;   // e.g. "SQF +0.12"
  delta_sqf: number;
  delta_gf: number;
  v_uplift_pct: number;
  delta_v_eur: number;
  rov_score: number;
  effort_score: number;
  time_to_impact_months: number;
}

export interface BuildRecommendationsInput {
  scoring: ScoringResult;
  /** NACE code used for sector-multiple lookup — same as in scoring. */
  naceCode?: string | null;
}

export function buildRecommendations({
  scoring,
  naceCode,
}: BuildRecommendationsInput): RecommendationOutput[] {
  const baseM = getSectorMultiple({ naceCode, sector: scoring.inputs.sector });
  const baseV = computeValuation({
    ebitda_eur: scoring.inputs.ebitda,
    m_sector: baseM,
    sqf: scoring.composite.sqf,
    gf: scoring.growth.gf,
  }).v_current_eur;

  const candidates: Array<RecommendationOutput & { sortKey: number }> = [];

  for (const entry of ACTION_CATALOGUE) {
    if (!entry.fires_when(scoring)) continue;

    const deltaSqf = entry.delta_sqf ?? 0;
    const deltaGf = entry.delta_gf ?? 0;
    const newSqf = clamp(scoring.composite.sqf + deltaSqf, 0.6, 1.4);
    const newGf = clamp(scoring.growth.gf + deltaGf, 0.7, 1.5);

    const newV = computeValuation({
      ebitda_eur: scoring.inputs.ebitda,
      m_sector: baseM,
      sqf: newSqf,
      gf: newGf,
    }).v_current_eur;

    const deltaVEur = newV - baseV;
    if (baseV <= 0 || deltaVEur <= 0) continue;
    const deltaVPct = (deltaVEur / baseV) * 100;

    const objectiveWeight =
      entry.objective_weights?.[scoring.inputs.stated_objective as StatedObjective] ?? 1.0;

    const rovScore = (deltaVPct / (entry.effort_score * entry.time_to_impact_months)) * objectiveWeight;

    candidates.push({
      sortKey: rovScore,
      id: entry.id,
      rank: 1,                            // overwritten below
      title: entry.title,
      description: entry.description,
      capital_key: entry.capital_key,
      capital_impact: formatImpact(entry),
      delta_sqf: deltaSqf,
      delta_gf: deltaGf,
      v_uplift_pct: round1(deltaVPct),
      delta_v_eur: Math.round(deltaVEur),
      rov_score: round2(rovScore),
      effort_score: entry.effort_score,
      time_to_impact_months: entry.time_to_impact_months,
    });
  }

  candidates.sort((a, b) => b.sortKey - a.sortKey);
  const top3 = candidates.slice(0, 3);

  return top3.map((c, i) => ({
    ...c,
    rank: (i + 1) as 1 | 2 | 3,
  }));
}

// =============================================================================
// Helpers
// =============================================================================
function formatImpact(entry: ActionCatalogueEntry): string {
  const parts: string[] = [];
  if (entry.delta_sqf) parts.push(`SQF +${entry.delta_sqf.toFixed(2)}`);
  if (entry.delta_gf)  parts.push(`GF +${entry.delta_gf.toFixed(2)}`);
  return parts.join(' · ') || 'Transferability ↑';
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
