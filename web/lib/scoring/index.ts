/**
 * Phase 06 — Scoring pipeline entry point.
 *
 * Orchestrates the six stages and returns a complete `ScoringResult`:
 *
 *   1) Stage 1  · deriveMetrics              (metrics.ts)
 *   2) Stage 2  · rankAgainstPeers           (benchmarks.ts)
 *   3) Stage 3  · aggregateCapitals          (aggregate.ts)
 *   4) Stage 4  · composeScores              (aggregate.ts)
 *   5) Stage 5  · computeGrowthFactor        (valuation.ts)
 *   6) Stage 6  · computeValuation           (valuation.ts)
 *   ·  Fragility flags + Risk Index          (flags.ts)
 *
 * This module is plain TypeScript — callable from a Next.js Server
 * Action, a Route Handler, a unit test, or (with the same signatures)
 * a Deno Edge Function later if we choose to move the pipeline off the
 * Next.js process.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import type { DiagnosticInput } from '@/lib/diagnostic-schema';
import type { ScoringResult } from './types';

import { deriveMetrics } from './metrics';
import { rankAgainstPeers } from './benchmarks';
import { aggregateCapitals, composeScores, scalabilityIndex } from './aggregate';
import { computeGrowthFactor, computeValuation } from './valuation';
import { deriveFragilityFlags, riskIndex } from './flags';
import { getSectorMultiple } from './sector-multiples';

export interface ScoringContext {
  /** Optional — exact peer group from vip.context.peer_group_name (lookup tier 1). */
  peerGroupName?: string | null;
  /** Optional — NACE code, used both for peer fallback and sector-multiple lookup. */
  naceCode?: string | null;
  /** Optional — service-role Supabase client. When absent the engine uses synthetic priors. */
  supabase?: SupabaseClient<Database, 'vip'> | null;
}

export async function runScoring(
  input: DiagnosticInput,
  ctx: ScoringContext = {},
): Promise<ScoringResult> {
  // Stage 1
  const metrics = deriveMetrics(input);

  // Stage 2
  const percentiles = await rankAgainstPeers(metrics, {
    peerGroupName: ctx.peerGroupName ?? null,
    naceCode: ctx.naceCode ?? null,
    supabase: ctx.supabase ?? null,
  });

  // Stage 3 + 4
  const capitals = aggregateCapitals(percentiles);
  const composite = composeScores(capitals);
  const scal_idx = scalabilityIndex(capitals, percentiles);

  // Stage 5
  const growth = computeGrowthFactor({
    revenue_cagr_2y_pct: metrics.revenue_cagr_2y_pct,
    lifecycle_stage: input.lifecycle_stage,
    business_scalability: input.business_scalability,
  });

  // Stage 6
  const m_sector = getSectorMultiple({ naceCode: ctx.naceCode, sector: input.sector });
  const valuation = computeValuation({
    ebitda_eur: input.ebitda,
    m_sector,
    sqf: composite.sqf,
    gf: growth.gf,
    // Phase 06: no recommendations yet → no potential uplift. Phase 08 will
    // re-run computeValuation with the actual Top-3 uplift sum.
    top3_uplift_pct_sum: 0,
  });

  // Flags + risk
  const flags = deriveFragilityFlags(input, metrics);
  const risk_index = riskIndex(flags);

  return {
    inputs: input,
    metrics,
    percentiles,
    capitals,
    composite,
    growth,
    valuation,
    quality_score: Math.round(composite.cqs),
    scalability_index: scal_idx,
    risk_index,
    flags,
  };
}

// Re-export individual stage modules so callers (Phase 08 reco engine,
// Phase 09 simulation engine) can hit pure functions without going
// through `runScoring` again.
export * from './types';
export { deriveMetrics } from './metrics';
export { rankAgainstPeers } from './benchmarks';
export { aggregateCapitals, composeScores, scalabilityIndex } from './aggregate';
export { computeGrowthFactor, computeValuation } from './valuation';
export { deriveFragilityFlags, riskIndex } from './flags';
export { getSectorMultiple, lookupBaseMultiple, applyIlliquidityDiscount } from './sector-multiples';
export { buildRecommendations, type RecommendationOutput } from './recommendations';
export { ACTION_CATALOGUE, type ActionCatalogueEntry } from './action-catalogue';
