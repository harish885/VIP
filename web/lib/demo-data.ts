/**
 * Demo dataset for ACME INDUSTRIE S.R.L.
 *
 * Used by the /dashboard view while we're in demo mode (no auth, no real
 * submission writes). When Phase 06's scoring Edge Function lands, the
 * dashboard will read from vip.valuations instead of this file.
 *
 * Numbers are internally consistent:
 *
 *   V = EBITDA_norm × M_sector × SQF × GF
 *     = 0.75M × 5.0 × 1.05 × 1.07
 *     ≈ €4.21M  ✓
 *
 *   V_potential after Top-3 actions (compound uplifts) ≈ €5.8M
 *   Value Gap = (5.80 − 4.20) / 4.20 ≈ +38%
 */

export const DEMO_COMPANY = {
  name: 'ACME INDUSTRIE S.R.L.',
  sector: 'Manufacturing',
  province: 'Lombardia',
  nace_code: '282',
  lifecycle_stage: 'Maturity',
  initials: 'AI',
} as const;

export const DEMO_VALUATION = {
  // Headline numbers
  v_current_eur: 4_200_000,
  v_low_eur:     3_800_000,
  v_high_eur:    4_700_000,
  v_potential_eur: 5_800_000,
  value_gap_pct: 38,

  // Building blocks of V
  ebitda_norm_eur: 750_000,
  m_sector:        5.0,
  sqf:             1.05,
  gf:              1.07,

  // Composite indices
  quality_score:     67,
  risk_index:        'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
  scalability_index: 58,

  // Per-capital scores (0–100, peer-relative percentiles)
  capitals: [
    { key: 'fin',   name: 'Financial',     score: 68, weight: 35, color: 'cap-fin'   },
    { key: 'tech',  name: 'Technological', score: 54, weight: 20, color: 'cap-tech'  },
    { key: 'human', name: 'Human & Org',   score: 71, weight: 25, color: 'cap-human' },
    { key: 'rel',   name: 'Relational',    score: 55, weight: 20, color: 'cap-rel'   },
  ] as const,

  // Fragility flags surfaced by scoring engine
  flags: ['client_concentration'] as const,
} as const;

export const DEMO_ACTIONS = [
  {
    rank: 1,
    title: 'Reduce client concentration',
    detail: 'From 60% top-3 to <40%.',
    capital_impact: 'SQF +0.12',
    v_uplift_pct: 12,
    time_horizon_months: 24,
    after_score: 78,
    capital_key: 'fin',
  },
  {
    rank: 2,
    title: 'Introduce recurring revenue',
    detail: 'Subscription or multi-year contracts.',
    capital_impact: 'GF +0.15',
    v_uplift_pct: 9,
    time_horizon_months: 18,
    after_score: null,
    capital_key: 'rel',
  },
  {
    rank: 3,
    title: 'Strengthen middle management',
    detail: 'Reduce founder dependency, build transferability.',
    capital_impact: 'Transferability low → high',
    v_uplift_pct: 7,
    time_horizon_months: 36,
    after_score: null,
    capital_key: 'human',
  },
] as const;

/** Levers the user can drag in the Simulation Engine teaser. */
export const DEMO_LEVERS = [
  { key: 'concentration', label: 'Top-3 client concentration', current: 60, target: 40, unit: '%' },
  { key: 'recurring',     label: 'Recurring revenue share',    current: 18, target: 45, unit: '%' },
  { key: 'rd_intensity',  label: 'R&D / revenue',              current: 1.2, target: 3.5, unit: '%' },
] as const;
