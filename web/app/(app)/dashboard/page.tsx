import { cookies } from 'next/headers';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import {
  fromDemo,
  fromValuationRow,
  type DashboardData,
  type FromRealOptions,
} from '@/lib/dashboard-data';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';        // cookies / per-request

const DEMO_COOKIE = 'vip_demo_submission_id';

/**
 * /dashboard
 *
 * 1. If the user is authenticated, fetch their most recent valuation.
 * 2. Otherwise, fall back to the demo cookie dropped by the diagnostic
 *    server action (Phase 06) so an anonymous run still hits a real row.
 * 3. If neither yields a row, render the seeded ACME demo profile so the
 *    product surface is always visible during the academic presentation.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { submitted?: string; company?: string };
}) {
  const submittedId = searchParams?.submitted ?? null;
  const data = await loadDashboardData(submittedId);
  return <DashboardView data={data} />;
}

async function loadDashboardData(submittedId: string | null): Promise<DashboardData> {
  const userClient = createClient();
  const { data: { user } } = await userClient.auth.getUser();

  const service = createServiceClient();

  // --- Path 1 · Authenticated -------------------------------------------------
  if (user) {
    const real = await loadLatestForUser(service, user.id, submittedId);
    if (real) return real;
    return fromDemo();
  }

  // --- Path 2 · Demo cookie ---------------------------------------------------
  const cookieId = cookies().get(DEMO_COOKIE)?.value ?? null;
  const submissionId = submittedId ?? cookieId;
  if (submissionId) {
    const real = await loadBySubmissionId(service, submissionId, Boolean(submittedId));
    if (real) return real;
  }

  // --- Path 3 · Demo fallback -------------------------------------------------
  return fromDemo();
}

type ServiceClient = ReturnType<typeof createServiceClient>;

async function loadLatestForUser(
  service: ServiceClient,
  userId: string,
  submittedId: string | null,
): Promise<DashboardData | null> {
  const query = service
    .from('valuations')
    .select(
      `id, submission_id, company_id, v_current_eur, v_low_eur, v_high_eur,
       v_potential_eur, value_gap_pct, ebitda_norm, m_sector, sqf, gf,
       quality_score, risk_index, scalability_index,
       cap_financial, cap_technological, cap_human, cap_relational, flags`,
    )
    .eq('user_id', userId);

  const { data: rows, error } = submittedId
    ? await query.eq('submission_id', submittedId).limit(1)
    : await query.order('computed_at', { ascending: false }).limit(1);

  if (error || !rows || rows.length === 0) return null;
  const valuation = rows[0]!;
  return assembleData(service, valuation, Boolean(submittedId));
}

async function loadBySubmissionId(
  service: ServiceClient,
  submissionId: string,
  highlight: boolean,
): Promise<DashboardData | null> {
  const { data: rows, error } = await service
    .from('valuations')
    .select(
      `id, submission_id, company_id, v_current_eur, v_low_eur, v_high_eur,
       v_potential_eur, value_gap_pct, ebitda_norm, m_sector, sqf, gf,
       quality_score, risk_index, scalability_index,
       cap_financial, cap_technological, cap_human, cap_relational, flags`,
    )
    .eq('submission_id', submissionId)
    .limit(1);

  if (error || !rows || rows.length === 0) return null;
  const valuation = rows[0]!;
  return assembleData(service, valuation, highlight);
}

async function assembleData(
  service: ServiceClient,
  valuation: {
    id: string;
    submission_id: string;
    company_id: string;
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
  },
  highlight: boolean,
): Promise<DashboardData> {
  const { data: company } = await service
    .from('companies')
    .select(
      `name, sector, nace_code, province, lifecycle_stage,
       distinctive_assets, stated_objective, time_horizon`,
    )
    .eq('id', valuation.company_id)
    .single();

  const { data: submission } = await service
    .from('submissions')
    .select(
      `revenue_y_1, revenue_y_2, revenue_y_3, ebitda,
       recurring_revenue_pct, top3_client_concentration, tech_investment_ratio_pct,
       founder_dependency, management_structure, digital_maturity,
       client_portfolio_quality, business_scalability, network_partnerships`,
    )
    .eq('id', valuation.submission_id)
    .single();

  const { data: recommendations } = await service
    .from('recommendations')
    .select('rank, title, description, capital_impact, v_uplift_pct, time_horizon_months')
    .eq('valuation_id', valuation.id)
    .order('rank', { ascending: true });

  const opts: FromRealOptions = {
    company: company ?? {
      name: 'Your company',
      sector: 'SME',
      nace_code: null,
      province: null,
      lifecycle_stage: null,
    },
    valuation,
    submission: submission ?? null,
    recommendations: recommendations ?? [],
    submittedHighlight: highlight,
  };
  return fromValuationRow(opts);
}
