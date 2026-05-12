/**
 * DashboardData — the canonical shape consumed by the dashboard view.
 *
 * Phase 07 introduces a single type so we can swap between:
 *   · seeded ACME demo numbers (`fromDemo()`)        — no submission yet
 *   · a real `vip.valuations` row (`fromValuationRow()`) — Phase 06 output
 *
 * The view itself stays unaware of where the numbers came from.
 */
import { DEMO_COMPANY, DEMO_VALUATION, DEMO_ACTIONS, DEMO_LEVERS } from '@/lib/demo-data';
import {
  EXAMPLE_DIAGNOSTIC,
  SECTORS,
  LIFECYCLES,
  TIME_HORIZONS,
  STATED_OBJECTIVES,
  type DiagnosticInput,
} from '@/lib/diagnostic-schema';
import { DEMO_SCORING_INPUT, type ScoringInput } from '@/lib/scoring/company-input';

export type CapitalKey = 'fin' | 'tech' | 'human' | 'rel';
export type RiskIndex = 'LOW' | 'MEDIUM' | 'HIGH';

export interface DashboardCompany {
  name: string;
  sector: string;
  province: string | null;
  nace_code: string | null;
  lifecycle_stage: string | null;
  initials: string;
}

export interface DashboardCapital {
  key: CapitalKey;
  name: string;
  score: number;
  weight: number;
  color: 'cap-fin' | 'cap-tech' | 'cap-human' | 'cap-rel';
}

export interface DashboardValuation {
  v_current_eur: number;
  v_low_eur: number;
  v_high_eur: number;
  v_potential_eur: number;
  value_gap_pct: number;
  ebitda_norm_eur: number;
  m_sector: number;
  sqf: number;
  gf: number;
  quality_score: number;
  risk_index: RiskIndex;
  scalability_index: number;
  capitals: DashboardCapital[];
  flags: string[];
}

export interface DashboardAction {
  rank: number;
  title: string;
  detail: string;
  capital_impact: string;
  v_uplift_pct: number;
  time_horizon_months: number;
  capital_key: CapitalKey | string;
}

export interface DashboardLever {
  key: string;
  label: string;
  current: number;
  target: number;
  unit: string;
}

export interface DashboardData {
  company: DashboardCompany;
  valuation: DashboardValuation;
  actions: DashboardAction[];
  levers: DashboardLever[];
  /** NACE code for the company — drives sector-multiple lookup in the sim. */
  naceCode: string | null;
  /** Baseline scoring input the simulation panel mutates client-side. */
  simulationBaseline: ScoringInput;
  source: 'demo' | 'submission';
  submittedHighlight?: boolean;
}

// =============================================================================
// Adapters
// =============================================================================

export function fromDemo(): DashboardData {
  return {
    company:   { ...DEMO_COMPANY },
    valuation: {
      v_current_eur:    DEMO_VALUATION.v_current_eur,
      v_low_eur:        DEMO_VALUATION.v_low_eur,
      v_high_eur:       DEMO_VALUATION.v_high_eur,
      v_potential_eur:  DEMO_VALUATION.v_potential_eur,
      value_gap_pct:    DEMO_VALUATION.value_gap_pct,
      ebitda_norm_eur:  DEMO_VALUATION.ebitda_norm_eur,
      m_sector:         DEMO_VALUATION.m_sector,
      sqf:              DEMO_VALUATION.sqf,
      gf:               DEMO_VALUATION.gf,
      quality_score:    DEMO_VALUATION.quality_score,
      risk_index:       DEMO_VALUATION.risk_index,
      scalability_index: DEMO_VALUATION.scalability_index,
      capitals: DEMO_VALUATION.capitals.map((c) => ({ ...c })),
      flags:    [...DEMO_VALUATION.flags],
    },
    actions: DEMO_ACTIONS.map((a) => ({ ...a })),
    levers:  DEMO_LEVERS.map((l) => ({ ...l })),
    naceCode: DEMO_COMPANY.nace_code,
    simulationBaseline: { ...DEMO_SCORING_INPUT },
    source:  'demo',
  };
}

// =============================================================================
// From a real vip.valuations row + the underlying submission
// =============================================================================
export interface ValuationRowLike {
  v_current_eur: number | null;
  v_low_eur: number | null;
  v_high_eur: number | null;
  v_potential_eur: number | null;
  value_gap_pct: number | null;
  ebitda_norm: number | null;
  m_sector: number | null;
  sqf: number | null;
  gf: number | null;
  quality_score: number | null;
  risk_index: string | null;
  scalability_index: number | null;
  cap_financial: number | null;
  cap_technological: number | null;
  cap_human: number | null;
  cap_relational: number | null;
  flags: string[] | null;
}

export interface CompanyRowLike {
  name: string;
  sector: string | null;
  province: string | null;
  nace_code: string | null;
  lifecycle_stage: string | null;
}

export interface SubmissionRowLike {
  revenue_y_1: number | null;
  revenue_y_2: number | null;
  revenue_y_3: number | null;
  ebitda: number | null;
  recurring_revenue_pct: number | null;
  top3_client_concentration: number | null;
  tech_investment_ratio_pct: number | null;
  founder_dependency: number | null;
  management_structure: number | null;
  digital_maturity: number | null;
  client_portfolio_quality: number | null;
  business_scalability: number | null;
  network_partnerships: number | null;
}

export interface RecommendationRowLike {
  rank: number;
  title: string;
  description: string | null;
  capital_impact: string | null;
  v_uplift_pct: number | null;
  time_horizon_months: number | null;
}

export interface CompanyExtras {
  stated_objective: string | null;
  time_horizon: string | null;
  distinctive_assets: string | null;
}

export interface FromRealOptions {
  company: CompanyRowLike & Partial<CompanyExtras>;
  valuation: ValuationRowLike;
  submission?: SubmissionRowLike | null;
  recommendations?: RecommendationRowLike[];
  submittedHighlight?: boolean;
}

export function fromValuationRow(opts: FromRealOptions): DashboardData {
  const { company, valuation, submission, recommendations } = opts;

  const capitals: DashboardCapital[] = [
    { key: 'fin',   name: 'Financial',     score: clamp100(valuation.cap_financial),     weight: 35, color: 'cap-fin'   },
    { key: 'tech',  name: 'Technological', score: clamp100(valuation.cap_technological), weight: 20, color: 'cap-tech'  },
    { key: 'human', name: 'Human & Org',   score: clamp100(valuation.cap_human),         weight: 25, color: 'cap-human' },
    { key: 'rel',   name: 'Relational',    score: clamp100(valuation.cap_relational),    weight: 20, color: 'cap-rel'   },
  ];

  // Either real recommendations from Phase 08 or the DEMO_ACTIONS placeholder.
  const actions: DashboardAction[] = recommendations && recommendations.length > 0
    ? recommendations
        .slice()
        .sort((a, b) => a.rank - b.rank)
        .map((r) => ({
          rank: r.rank,
          title: r.title,
          detail: r.description ?? '',
          capital_impact: r.capital_impact ?? '',
          v_uplift_pct: r.v_uplift_pct ?? 0,
          time_horizon_months: r.time_horizon_months ?? 24,
          capital_key: 'fin',
        }))
    : DEMO_ACTIONS.map((a) => ({ ...a }));

  // Levers — drive from the submission's current values, defaults from demo.
  const levers: DashboardLever[] = DEMO_LEVERS.map((l) => {
    if (!submission) return { ...l };
    const current = readLever(l.key, submission);
    return { ...l, current: current ?? l.current };
  });

  const simulationBaseline = buildBaseline(company, submission ?? null);

  return {
    company: {
      name: company.name,
      sector: company.sector ?? 'SME',
      province: company.province,
      nace_code: company.nace_code,
      lifecycle_stage: company.lifecycle_stage,
      initials: initialsFor(company.name),
    },
    valuation: {
      v_current_eur:    valuation.v_current_eur ?? 0,
      v_low_eur:        valuation.v_low_eur ?? 0,
      v_high_eur:       valuation.v_high_eur ?? 0,
      v_potential_eur:  valuation.v_potential_eur ?? 0,
      value_gap_pct:    Math.round(valuation.value_gap_pct ?? 0),
      ebitda_norm_eur:  valuation.ebitda_norm ?? 0,
      m_sector:         valuation.m_sector ?? 0,
      sqf:              valuation.sqf ?? 1,
      gf:               valuation.gf ?? 1,
      quality_score:    valuation.quality_score ?? 0,
      risk_index:       coerceRisk(valuation.risk_index),
      scalability_index: valuation.scalability_index ?? 0,
      capitals,
      flags:            valuation.flags ?? [],
    },
    actions,
    levers,
    naceCode: company.nace_code,
    simulationBaseline,
    source: 'submission',
    submittedHighlight: opts.submittedHighlight,
  };
}

// =============================================================================
// Build a usable ScoringInput from a persisted submission + company.
// Used as the baseline for the Phase 09 simulation engine.
// =============================================================================
function buildBaseline(
  company: CompanyRowLike & Partial<CompanyExtras>,
  submission: SubmissionRowLike | null,
): ScoringInput {
  const demo = DEMO_SCORING_INPUT;
  return {
    ...demo,
    revenue_y_1: submission?.revenue_y_1 ?? demo.revenue_y_1,
    revenue_y_2: submission?.revenue_y_2 ?? demo.revenue_y_2,
    revenue_y_3: submission?.revenue_y_3 ?? demo.revenue_y_3,
    ebitda: submission?.ebitda ?? demo.ebitda,
    ebitda_margin_pct: demo.ebitda_margin_pct,
    recurring_revenue_pct: submission?.recurring_revenue_pct ?? demo.recurring_revenue_pct,
    top3_client_concentration: submission?.top3_client_concentration ?? demo.top3_client_concentration,
    tech_investment_ratio_pct: submission?.tech_investment_ratio_pct ?? demo.tech_investment_ratio_pct,
    founder_dependency: clamp15(submission?.founder_dependency ?? demo.founder_dependency),
    management_structure: clamp15(submission?.management_structure ?? demo.management_structure),
    digital_maturity: clamp15(submission?.digital_maturity ?? demo.digital_maturity),
    client_portfolio_quality: clamp15(submission?.client_portfolio_quality ?? demo.client_portfolio_quality),
    business_scalability: clamp15(submission?.business_scalability ?? demo.business_scalability),
    network_partnerships: clamp15(submission?.network_partnerships ?? demo.network_partnerships),
    sector: coerceSector(company.sector),
    lifecycle_stage: coerceLifecycle(company.lifecycle_stage),
    distinctive_assets: company.distinctive_assets ?? '',
    stated_objective: coerceObjective(company.stated_objective),
    time_horizon: coerceHorizon(company.time_horizon ?? null),
  };
}

function coerceObjective(s: string | null | undefined): DiagnosticInput['stated_objective'] {
  return (STATED_OBJECTIVES.find((x) => x === s) ?? 'growth') as DiagnosticInput['stated_objective'];
}

function clamp15(n: number | null): 1 | 2 | 3 | 4 | 5 {
  const v = Math.round(n ?? 3);
  if (v <= 1) return 1;
  if (v >= 5) return 5;
  return v as 2 | 3 | 4;
}

function coerceSector(s: string | null): NonNullable<DiagnosticInput['sector']> {
  return (SECTORS.find((x) => x === s) ?? 'Manufacturing') as NonNullable<DiagnosticInput['sector']>;
}

function coerceLifecycle(s: string | null): NonNullable<DiagnosticInput['lifecycle_stage']> {
  return (LIFECYCLES.find((x) => x === s) ?? 'Maturity') as NonNullable<DiagnosticInput['lifecycle_stage']>;
}

function coerceHorizon(s: string | null): DiagnosticInput['time_horizon'] {
  return (TIME_HORIZONS.find((x) => x === s) ?? '24m') as DiagnosticInput['time_horizon'];
}

// =============================================================================
// Helpers
// =============================================================================
function clamp100(n: number | null): number {
  if (n === null) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function coerceRisk(s: string | null): RiskIndex {
  if (s === 'LOW' || s === 'MEDIUM' || s === 'HIGH') return s;
  return 'MEDIUM';
}

function initialsFor(name: string): string {
  const cleaned = name.replace(/S\.R\.L\.|S\.P\.A\.|LTD|LLC|GMBH|SRL|SPA/gi, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '?';
  const second = parts[1]?.[0] ?? '';
  return (first + second).toUpperCase();
}

function readLever(key: string, s: SubmissionRowLike): number | null {
  switch (key) {
    case 'concentration': return s.top3_client_concentration;
    case 'recurring':     return s.recurring_revenue_pct;
    case 'rd_intensity':  return s.tech_investment_ratio_pct;
    default:              return null;
  }
}
