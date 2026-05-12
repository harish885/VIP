import { z } from 'zod';

/**
 * Diagnostic schema — the 17 inputs the entrepreneur fills in to get a
 * valuation. Used by the multi-step form on /diagnostic and (eventually)
 * the scoring Edge Function on the server.
 *
 * Mirrors the columns on vip.submissions (with two derived fields —
 * revenue_cagr_pct and ebitda_margin_pct — computed in `deriveMetrics`
 * below rather than asked for directly).
 */

// =============================================================================
// CORE SCHEMA
// =============================================================================

export const LIFECYCLES = ['Early', 'Growth', 'Maturity', 'Decline'] as const;
export const TIME_HORIZONS = ['12m', '24m', '36m', '60m'] as const;

export const SECTORS = [
  'Manufacturing',
  'Wholesale & Distribution',
  'Professional Services',
  'Tech / Software',
  'Retail / e-Commerce',
  'Construction',
  'Logistics',
  'Other',
] as const;

export const OBJECTIVES = [
  { value: 'grow_value',     label: 'Grow company value before exit' },
  { value: 'prepare_exit',   label: 'Prepare for an exit / sale' },
  { value: 'raise_capital',  label: 'Raise growth capital' },
  { value: 'evaluate_target',label: 'Evaluate an acquisition target' },
  { value: 'succession',     label: 'Succession planning' },
  { value: 'diagnostic',     label: 'Periodic health check' },
] as const;

export const DiagnosticSchema = z.object({
  // ---- Quantitative (7 fields, 6 conceptual inputs — revenue 3y is one) ----
  revenue_y_1: z.number({ invalid_type_error: 'Required' }).min(0, 'Must be ≥ 0'),
  revenue_y_2: z.number({ invalid_type_error: 'Required' }).min(0, 'Must be ≥ 0'),
  revenue_y_3: z.number({ invalid_type_error: 'Required' }).min(0, 'Must be ≥ 0'),
  ebitda:      z.number({ invalid_type_error: 'Required' }),
  recurring_revenue_pct:     z.number().min(0, '≥ 0').max(100, '≤ 100'),
  top3_client_concentration: z.number().min(0, '≥ 0').max(100, '≤ 100'),
  tech_investment_ratio_pct: z.number().min(0, '≥ 0').max(100, '≤ 100'),

  // ---- Qualitative · 1–5 (6 fields) ----
  founder_dependency:       z.number().int().min(1).max(5),
  management_structure:     z.number().int().min(1).max(5),
  digital_maturity:         z.number().int().min(1).max(5),
  client_portfolio_quality: z.number().int().min(1).max(5),
  business_scalability:     z.number().int().min(1).max(5),
  network_partnerships:     z.number().int().min(1).max(5),

  // ---- Contextual (5 fields) ----
  sector:             z.enum(SECTORS),
  lifecycle_stage:    z.enum(LIFECYCLES),
  distinctive_assets: z.string().max(200).optional().or(z.literal('')),
  stated_objective:   z.string().min(1, 'Pick an objective'),
  time_horizon:       z.enum(TIME_HORIZONS),
});

export type DiagnosticInput = z.infer<typeof DiagnosticSchema>;

// =============================================================================
// DEFAULTS (empty form)
// =============================================================================

export const EMPTY_DIAGNOSTIC: Partial<DiagnosticInput> = {
  revenue_y_1: undefined,
  revenue_y_2: undefined,
  revenue_y_3: undefined,
  ebitda: undefined,
  recurring_revenue_pct: undefined,
  top3_client_concentration: undefined,
  tech_investment_ratio_pct: undefined,

  founder_dependency: 3,
  management_structure: 3,
  digital_maturity: 3,
  client_portfolio_quality: 3,
  business_scalability: 3,
  network_partnerships: 3,

  distinctive_assets: '',
};

// =============================================================================
// EXAMPLE VALUES — for the "Fill with example" button (ACME profile)
// =============================================================================

export const EXAMPLE_DIAGNOSTIC: DiagnosticInput = {
  revenue_y_1: 6_200_000,
  revenue_y_2: 7_100_000,
  revenue_y_3: 8_400_000,
  ebitda: 750_000,
  recurring_revenue_pct: 18,
  top3_client_concentration: 60,
  tech_investment_ratio_pct: 1.2,

  founder_dependency: 4,        // Heavy reliance on founder
  management_structure: 3,      // OK but thin
  digital_maturity: 2,          // Behind
  client_portfolio_quality: 3,  // Concentrated
  business_scalability: 4,      // Decent
  network_partnerships: 3,      // Average

  sector: 'Manufacturing',
  lifecycle_stage: 'Maturity',
  distinctive_assets: 'Patent on cooling-coil design; 3 long-term automotive OEM contracts',
  stated_objective: 'grow_value',
  time_horizon: '24m',
};

// =============================================================================
// DERIVED METRICS — computed from the raw inputs above
// =============================================================================

/**
 * From the 3 revenue years + EBITDA, derive the two ratios the scoring
 * engine needs: revenue CAGR and EBITDA margin.
 */
export function deriveMetrics(input: DiagnosticInput) {
  const { revenue_y_1, revenue_y_3, ebitda } = input;
  const cagr =
    revenue_y_1 > 0 && revenue_y_3 > 0
      ? (Math.pow(revenue_y_3 / revenue_y_1, 1 / 2) - 1) * 100
      : 0;
  const margin = revenue_y_3 > 0 ? (ebitda / revenue_y_3) * 100 : 0;
  return {
    revenue_cagr_pct: round1(cagr),
    ebitda_margin_pct: round1(margin),
  };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

// =============================================================================
// FIELD LABEL MAP — for the review step
// =============================================================================

export const FIELD_LABELS: Record<keyof DiagnosticInput, string> = {
  revenue_y_1: 'Revenue · 3 years ago',
  revenue_y_2: 'Revenue · 2 years ago',
  revenue_y_3: 'Revenue · last year',
  ebitda: 'EBITDA',
  recurring_revenue_pct: 'Recurring revenue %',
  top3_client_concentration: 'Top-3 client concentration %',
  tech_investment_ratio_pct: 'Tech investment / revenue %',

  founder_dependency: 'Founder dependency',
  management_structure: 'Management structure',
  digital_maturity: 'Digital maturity',
  client_portfolio_quality: 'Client portfolio quality',
  business_scalability: 'Business model scalability',
  network_partnerships: 'Network & partnerships',

  sector: 'Sector',
  lifecycle_stage: 'Lifecycle stage',
  distinctive_assets: 'Distinctive assets',
  stated_objective: 'Stated objective',
  time_horizon: 'Time horizon',
};
