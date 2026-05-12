/**
 * Phase 06 · Stages 5 + 6 — Growth Factor and the V calculation.
 *
 * Re-exported as the SAME pure-function module the Phase 09 client-side
 * Simulation Engine consumes for live re-computation. Keep it side-effect
 * free and dependency-free (no Supabase, no fetch).
 *
 *   V         = EBITDA · M_sector · SQF · GF
 *   V_low     = V · 0.90
 *   V_high    = V · 1.12
 *   V_pot     = V · (1 + Σ top3_uplift_pct / 100)
 *   gap_pct   = (V_pot − V) / V · 100
 */
import type {
  GrowthFactor,
  ValuationOutputs,
} from './types';
import type { DiagnosticInput } from '@/lib/diagnostic-schema';

// =============================================================================
// Stage 5 — Growth Factor
// =============================================================================
const LIFECYCLE_MODIFIERS: Record<string, number> = {
  Early:    1.10,
  Growth:   1.15,
  Maturity: 1.00,
  Decline:  0.90,
};

export function computeGrowthFactor(input: {
  revenue_cagr_2y_pct: number;
  lifecycle_stage: DiagnosticInput['lifecycle_stage'];
  business_scalability: number;  // 1–5
}): GrowthFactor {
  const cagrFrac = clamp(input.revenue_cagr_2y_pct / 100, -0.3, 0.5);
  const gf_base = 1.0 + cagrFrac * 0.4;

  const lifecycle_modifier = LIFECYCLE_MODIFIERS[input.lifecycle_stage] ?? 1.0;
  const scalability_modifier = 0.92 + (clamp(input.business_scalability, 1, 5) - 1) * 0.03;
  //   1 → 0.92   2 → 0.95   3 → 0.98   4 → 1.01   5 → 1.04

  const gf_raw = gf_base * lifecycle_modifier * scalability_modifier;
  const gf = round2(clamp(gf_raw, 0.7, 1.5));

  return {
    gf_base: round2(gf_base),
    lifecycle_modifier,
    scalability_modifier: round2(scalability_modifier),
    gf,
  };
}

// =============================================================================
// Stage 6 — V
// =============================================================================
export interface ValuationInputs {
  ebitda_eur: number;
  m_sector: number;
  sqf: number;
  gf: number;
  /** Sum of top-3 actions' v_uplift_pct values (in %, not fraction). */
  top3_uplift_pct_sum?: number;
}

export function computeValuation(v: ValuationInputs): ValuationOutputs {
  const value = v.ebitda_eur * v.m_sector * v.sqf * v.gf;
  const v_current_eur   = roundEur(value);
  const v_low_eur       = roundEur(value * 0.90);
  const v_high_eur      = roundEur(value * 1.12);
  const upliftFraction  = (v.top3_uplift_pct_sum ?? 0) / 100;
  const v_potential_eur = roundEur(value * (1 + upliftFraction));

  const value_gap_pct = v_current_eur > 0
    ? roundUnit(((v_potential_eur - v_current_eur) / v_current_eur) * 100)
    : 0;

  return {
    m_sector: round2(v.m_sector),
    v_current_eur,
    v_low_eur,
    v_high_eur,
    v_potential_eur,
    value_gap_pct,
  };
}

// =============================================================================
// Helpers (kept local — no dependencies)
// =============================================================================
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function roundUnit(n: number): number {
  return Math.round(n);
}
/** Round EUR figures to the nearest 1 000 — same precision shown on the dashboard. */
function roundEur(n: number): number {
  return Math.round(n / 1000) * 1000;
}
