/**
 * Loaders for the per-company workspace at /companies/[taxCode].
 *
 * Centralises the rules for "which VIP company row corresponds to this AIDA
 * tax code right now, and what's its latest valuation?". Three call sites
 * use these (page, results, action plan, scenario lab) so the resolution
 * stays consistent.
 *
 * Resolution order:
 *   1. An explicit `submission_id` (from ?submitted=… or a per-company
 *      cookie). We always trust this when present, because we just wrote
 *      that exact row a moment ago.
 *   2. The latest valuation across any vip.companies row whose tax_code
 *      matches. Used on refresh / direct navigation when no submission
 *      hint is present.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export type ServiceClient = SupabaseClient<Database, 'vip'>;

export type DiagnosisStatus = 'not_diagnosed' | 'diagnosed' | 'recent';

export interface CompanyRecord {
  id: string;
  name: string;
  sector: string | null;
  nace_code: string | null;
  province: string | null;
  lifecycle_stage: string | null;
  distinctive_assets: string | null;
  stated_objective: string | null;
  time_horizon: string | null;
  tax_code: string | null;
}

export interface ValuationRecord {
  id: string;
  submission_id: string;
  company_id: string;
  computed_at: string;
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

export interface SubmissionRecord {
  id: string;
  submitted_at: string;
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
  /** Provenance audit trail — added by 20260513000000 + 20260513100000. */
  overrides_enabled: boolean | null;
  override_revenue_y_3: number | null;
  override_ebitda: number | null;
  override_recurring_revenue_pct: number | null;
  override_top3_client_concentration: number | null;
  override_tech_investment_ratio_pct: number | null;
  aida_revenue_y_3: number | null;
  aida_ebitda: number | null;
  excluded_questions: string[] | null;
}

export interface RecommendationRecord {
  rank: number;
  title: string;
  description: string | null;
  capital_impact: string | null;
  v_uplift_pct: number | null;
  time_horizon_months: number | null;
}

export interface CompanyWorkspaceData {
  valuation: ValuationRecord;
  company: CompanyRecord;
  submission: SubmissionRecord;
  recommendations: RecommendationRecord[];
  status: DiagnosisStatus;
}

const VALUATION_COLUMNS =
  'id, submission_id, company_id, computed_at, v_current_eur, v_low_eur, v_high_eur, v_potential_eur, value_gap_pct, ebitda_norm, m_sector, sqf, gf, quality_score, risk_index, scalability_index, cap_financial, cap_technological, cap_human, cap_relational, flags';

const COMPANY_COLUMNS =
  'id, name, sector, nace_code, province, lifecycle_stage, distinctive_assets, stated_objective, time_horizon, tax_code';

const SUBMISSION_COLUMNS =
  'id, submitted_at, revenue_y_1, revenue_y_2, revenue_y_3, ebitda, recurring_revenue_pct, top3_client_concentration, tech_investment_ratio_pct, founder_dependency, management_structure, digital_maturity, client_portfolio_quality, business_scalability, network_partnerships, overrides_enabled, override_revenue_y_3, override_ebitda, override_recurring_revenue_pct, override_top3_client_concentration, override_tech_investment_ratio_pct, aida_revenue_y_3, aida_ebitda, excluded_questions';

const RECOMMENDATION_COLUMNS =
  'rank, title, description, capital_impact, v_uplift_pct, time_horizon_months';

export interface LoadCompanyWorkspaceOptions {
  /** Auth user id when signed in. NULL → anonymous demo session. */
  userId: string | null;
  /** ?submitted=<id> or per-tax-code cookie. Trusted exact match. */
  preferSubmissionId: string | null;
}

/**
 * Find the valuation we should render for this company right now.
 *
 * Scoping rules:
 *
 *   · Authenticated users only see their own diagnostics — every
 *     read filters `companies.user_id = userId`. This prevents one
 *     signed-in user from seeing another's valuation by guessing the
 *     tax code, even though we go through the service-role client.
 *
 *   · Anonymous demo users (userId === null) only see anonymous rows
 *     (`companies.user_id IS NULL`). When `preferSubmissionId` is set,
 *     the load is pinned to that exact submission and we verify both
 *     tax_code and ownership match before returning it.
 *
 *   · `preferSubmissionId` always wins when supplied — that's the row
 *     we just wrote — but it still has to belong to the caller.
 */
export async function loadCompanyWorkspace(
  service: ServiceClient,
  taxCode: string,
  opts: LoadCompanyWorkspaceOptions,
): Promise<CompanyWorkspaceData | null> {
  const { userId, preferSubmissionId } = opts;
  let valuation: ValuationRecord | null = null;

  if (preferSubmissionId) {
    valuation = await loadValuationBySubmission(service, preferSubmissionId);
    if (valuation) {
      const owner = await loadCompanyOwnership(service, valuation.company_id);
      // Reject if tax code mismatches OR the row belongs to someone else.
      const taxOk = owner?.tax_code === taxCode;
      const ownerOk = owner != null && ownsCompanyRow(owner.user_id, userId);
      if (!taxOk || !ownerOk) valuation = null;
    }
  }

  if (!valuation) {
    valuation = await loadLatestValuationForTaxCode(service, taxCode, userId);
  }

  if (!valuation) return null;

  const [company, submission, recommendations] = await Promise.all([
    loadCompanyById(service, valuation.company_id),
    loadSubmissionById(service, valuation.submission_id),
    loadRecommendationsFor(service, valuation.id),
  ]);

  if (!company || !submission) return null;

  return {
    valuation,
    company,
    submission,
    recommendations,
    status: diagnosisStatusFor(valuation.computed_at),
  };
}

/** True when the row belongs to the given caller (auth or anonymous). */
function ownsCompanyRow(rowUserId: string | null, callerUserId: string | null): boolean {
  if (callerUserId == null) return rowUserId == null;
  return rowUserId === callerUserId;
}

async function loadCompanyOwnership(
  service: ServiceClient,
  companyId: string,
): Promise<{ tax_code: string | null; user_id: string | null } | null> {
  const { data } = await service
    .from('companies')
    .select('tax_code, user_id')
    .eq('id', companyId)
    .maybeSingle();
  if (!data) return null;
  return { tax_code: data.tax_code ?? null, user_id: data.user_id ?? null };
}

/** Diagnosis status — used by the company workspace header and the
 *  /companies search list to badge "Not diagnosed" vs "Updated recently". */
export function diagnosisStatusFor(computed_at: string | null): DiagnosisStatus {
  if (!computed_at) return 'not_diagnosed';
  const ageDays = (Date.now() - new Date(computed_at).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 7) return 'recent';
  return 'diagnosed';
}

/** Map: tax_code → latest computed_at. Used by /companies for status badges.
 *  Scoped to the calling user (auth) or anonymous demo rows (no auth). */
export async function loadLatestComputedAtByTaxCode(
  service: ServiceClient,
  taxCodes: string[],
  userId: string | null = null,
): Promise<Map<string, string>> {
  if (taxCodes.length === 0) return new Map();
  let q = service.from('companies').select('id, tax_code').in('tax_code', taxCodes);
  if (userId) q = q.eq('user_id', userId);
  else q = q.is('user_id', null);
  const { data: companies, error: e1 } = await q;
  if (e1 || !companies) return new Map();
  const idToTax = new Map<string, string>();
  for (const c of companies) if (c.tax_code) idToTax.set(c.id, c.tax_code);
  if (idToTax.size === 0) return new Map();

  const { data: valuations } = await service
    .from('valuations')
    .select('company_id, computed_at')
    .in('company_id', [...idToTax.keys()])
    .order('computed_at', { ascending: false });

  const out = new Map<string, string>();
  if (!valuations) return out;
  for (const v of valuations) {
    const tc = idToTax.get(v.company_id);
    if (!tc) continue;
    if (!out.has(tc)) out.set(tc, v.computed_at);  // first hit = newest
  }
  return out;
}

// =============================================================================
// Single-row loaders
// =============================================================================

async function loadValuationBySubmission(
  service: ServiceClient,
  submissionId: string,
): Promise<ValuationRecord | null> {
  const { data, error } = await service
    .from('valuations')
    .select(VALUATION_COLUMNS)
    .eq('submission_id', submissionId)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('[loadValuationBySubmission] error:', error);
    return null;
  }
  return (data as ValuationRecord | null) ?? null;
}

async function loadLatestValuationForTaxCode(
  service: ServiceClient,
  taxCode: string,
  userId: string | null,
): Promise<ValuationRecord | null> {
  // Step 1: find vip.companies rows for this tax_code owned by the caller.
  let companiesQuery = service.from('companies').select('id').eq('tax_code', taxCode);
  if (userId) companiesQuery = companiesQuery.eq('user_id', userId);
  else companiesQuery = companiesQuery.is('user_id', null);

  const { data: companyIds } = await companiesQuery;
  if (!companyIds || companyIds.length === 0) return null;

  // Step 2: pick the freshest valuation across those rows.
  const { data } = await service
    .from('valuations')
    .select(VALUATION_COLUMNS)
    .in('company_id', companyIds.map((c) => c.id))
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as ValuationRecord | null) ?? null;
}

async function loadCompanyById(
  service: ServiceClient,
  companyId: string,
): Promise<CompanyRecord | null> {
  const { data } = await service
    .from('companies')
    .select(COMPANY_COLUMNS)
    .eq('id', companyId)
    .maybeSingle();
  return (data as CompanyRecord | null) ?? null;
}

async function loadSubmissionById(
  service: ServiceClient,
  submissionId: string,
): Promise<SubmissionRecord | null> {
  const { data } = await service
    .from('submissions')
    .select(SUBMISSION_COLUMNS)
    .eq('id', submissionId)
    .maybeSingle();
  return (data as SubmissionRecord | null) ?? null;
}

async function loadRecommendationsFor(
  service: ServiceClient,
  valuationId: string,
): Promise<RecommendationRecord[]> {
  const { data } = await service
    .from('recommendations')
    .select(RECOMMENDATION_COLUMNS)
    .eq('valuation_id', valuationId)
    .order('rank', { ascending: true });
  return (data as RecommendationRecord[] | null) ?? [];
}
