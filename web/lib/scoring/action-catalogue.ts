/**
 * Phase 08 — Action catalogue.
 *
 * Each entry encodes a structured intervention an SME can take. The
 * recommendation engine evaluates `fires_when` against the user's
 * scoring result, computes the expected ΔV uplift via the same shared
 * `computeValuation` math, and ranks by Return on Value (ROV).
 *
 * Keep this table additive — adding new actions never breaks existing
 * valuations; the ranker just picks the strongest three.
 */
import type { ScoringResult, CapitalKey } from './types';
import type { StatedObjective } from '@/lib/diagnostic-schema';

export interface ActionCatalogueEntry {
  /** Stable identifier — survives across catalogue edits. */
  id: string;
  title: string;
  description: string;
  capital_key: CapitalKey;
  /** SQF uplift applied when the action is enacted. */
  delta_sqf?: number;
  /** GF uplift applied when the action is enacted. */
  delta_gf?: number;
  effort_score: 1 | 2 | 3 | 4 | 5;             // 1 = easiest, 5 = transformational
  time_to_impact_months: number;
  /**
   * Stated-objective weights. Each user's `stated_objective` boosts ROV
   * for actions aligned with that objective.
   */
  objective_weights?: Partial<Record<StatedObjective, number>>;
  /** Predicate — should this action be a candidate for this profile? */
  fires_when: (r: ScoringResult) => boolean;
}

export const ACTION_CATALOGUE: ReadonlyArray<ActionCatalogueEntry> = [
  // ===========================================================================
  // Financial / Relational
  // ===========================================================================
  {
    id: 'reduce_client_concentration',
    title: 'Reduce client concentration',
    description: 'Diversify revenue so top-3 customers cover < 40% of sales.',
    capital_key: 'financial',
    delta_sqf: 0.12,
    effort_score: 2,
    time_to_impact_months: 18,
    objective_weights: { exit_preparation: 1.5, growth: 1.75, investor_readiness: 1.2 },
    fires_when: (r) => r.inputs.top3_client_concentration > 40,
  },
  {
    id: 'recurring_revenue',
    title: 'Introduce recurring revenue',
    description: 'Add subscription tiers or multi-year service contracts.',
    capital_key: 'relational',
    delta_gf: 0.15,
    effort_score: 3,
    time_to_impact_months: 12,
    objective_weights: { investor_readiness: 1.3, growth: 1.3, exit_preparation: 1.1 },
    fires_when: (r) => r.inputs.recurring_revenue_pct < 35,
  },
  {
    id: 'expand_geo',
    title: 'Expand geographic reach',
    description: 'Open one adjacent EU export channel within 12 months.',
    capital_key: 'relational',
    delta_sqf: 0.05,
    delta_gf: 0.05,
    effort_score: 4,
    time_to_impact_months: 18,
    objective_weights: { growth: 1.2 },
    fires_when: (r) => r.percentiles.network < 60 && r.inputs.business_scalability >= 3,
  },

  // ===========================================================================
  // Human & Organisational
  // ===========================================================================
  {
    id: 'middle_management',
    title: 'Strengthen middle management',
    description: 'Hire or promote two C-1 leaders to reduce founder dependency.',
    capital_key: 'human',
    delta_sqf: 0.08,
    effort_score: 2,
    time_to_impact_months: 24,
    objective_weights: { succession: 1.4, exit_preparation: 1.2, growth: 1.3 },
    // New Q5 scale: low score = high founder dependency. Fire when ≤ 3.
    fires_when: (r) => r.inputs.founder_dependency <= 3 || r.inputs.management_structure <= 3,
  },
  {
    id: 'governance_upgrade',
    title: 'Formalise governance',
    description: 'Establish a non-executive board and quarterly KPI review.',
    capital_key: 'human',
    delta_sqf: 0.05,
    effort_score: 2,
    time_to_impact_months: 12,
    objective_weights: { exit_preparation: 1.3, investor_readiness: 1.25 },
    fires_when: (r) => r.percentiles.management < 60,
  },

  // ===========================================================================
  // Technological
  // ===========================================================================
  {
    id: 'digital_upgrade',
    title: 'Digital maturity upgrade',
    description: 'Replace one legacy system; adopt ERP + BI standard stack.',
    capital_key: 'technological',
    delta_sqf: 0.08,
    delta_gf: 0.04,
    effort_score: 4,
    time_to_impact_months: 18,
    objective_weights: { growth: 1.15, investor_readiness: 1.1 },
    fires_when: (r) => r.inputs.digital_maturity <= 3,
  },
  {
    id: 'rd_investment',
    title: 'Increase R&D investment',
    description: 'Lift tech / R&D investment to ≥ 3% of revenue.',
    capital_key: 'technological',
    delta_gf: 0.08,
    effort_score: 3,
    time_to_impact_months: 24,
    objective_weights: { growth: 1.2, investor_readiness: 1.15 },
    fires_when: (r) => r.inputs.tech_investment_ratio_pct < 3,
  },

  // ===========================================================================
  // Financial · margin / leverage
  // ===========================================================================
  {
    id: 'margin_expansion',
    title: 'EBITDA margin expansion',
    description: 'Cost / pricing programme targeting +200 bps EBITDA in 12 months.',
    capital_key: 'financial',
    delta_sqf: 0.07,
    effort_score: 3,
    time_to_impact_months: 12,
    objective_weights: { growth: 1.0, investor_readiness: 1.15, exit_preparation: 1.1 },
    fires_when: (r) => r.metrics.ebitda_margin_pct < 7,
  },
  {
    id: 'deleverage',
    title: 'Strengthen balance sheet',
    description: 'Use 18 months of free cash flow to retire short-term debt.',
    capital_key: 'financial',
    delta_sqf: 0.06,
    effort_score: 2,
    time_to_impact_months: 18,
    objective_weights: { exit_preparation: 1.2, investor_readiness: 1.1 },
    fires_when: (r) => r.flags.includes('over_leveraged'),
  },
];
