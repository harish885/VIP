'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DiagnosticSchema, type DiagnosticInput } from '@/lib/diagnostic-schema';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { runScoring } from '@/lib/scoring';

export type SubmitResult = { ok: true; submissionId?: string } | { ok: false; error: string };

const DEMO_COOKIE = 'vip_demo_submission_id';

/**
 * submitDiagnosticAction (Phase 06 wiring)
 *
 *  1. Validate the 17-input payload against the Zod schema.
 *  2. Resolve the active user. If none, we run the demo path: service-role
 *     writes with user_id = NULL, then drop a short-lived cookie with the
 *     submission id so /dashboard can read the freshly-computed valuation.
 *  3. Find or create a company row. We then look up its peer-group name and
 *     NACE code from `vip.context` (matched on the AIDA sector keys) so the
 *     scoring engine can rank against the real calibration set.
 *  4. INSERT the submission row.
 *  5. Run the scoring pipeline (lib/scoring) and INSERT the valuation.
 *  6. Redirect to /dashboard?submitted=<submission_id>.
 *
 * Phase 08 will extend this to also persist recommendations.
 */
export async function submitDiagnosticAction(input: DiagnosticInput): Promise<SubmitResult> {
  const parsed = DiagnosticSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? 'Invalid submission.' };
  }
  const data = parsed.data;

  // Use the user-scoped server client to detect auth, but persist with the
  // service-role client either way — submissions/valuations bypass RLS so
  // we can write demo (anonymous) runs too.
  const userClient = createClient();
  const { data: { user } } = await userClient.auth.getUser();
  const service = createServiceClient();

  // ---------------------------------------------------------------------------
  // 1) Resolve / create company. In demo mode user_id is NULL.
  // ---------------------------------------------------------------------------
  let companyId: string;
  let companyNace: string | null = null;

  if (user) {
    const { data: existing } = await service
      .from('companies')
      .select('id, nace_code')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      companyId = existing.id;
      companyNace = existing.nace_code;
    } else {
      const created = await createCompany(service, user.id, data);
      if (!created.ok) return { ok: false, error: created.error };
      companyId = created.id;
      companyNace = created.nace_code;
    }
  } else {
    const created = await createCompany(service, null, data);
    if (!created.ok) return { ok: false, error: created.error };
    companyId = created.id;
    companyNace = created.nace_code;
  }

  // ---------------------------------------------------------------------------
  // 2) Look up peer group for benchmarking.
  // ---------------------------------------------------------------------------
  const { peerGroupName, naceCode } = await resolvePeerContext(
    service,
    companyNace ?? naceFromSector(data.sector),
  );

  // ---------------------------------------------------------------------------
  // 3) Insert submission.
  // ---------------------------------------------------------------------------
  const ebitdaMargin = data.revenue_y_3 > 0 ? (data.ebitda / data.revenue_y_3) * 100 : null;
  const revenueCagr =
    data.revenue_y_1 > 0 && data.revenue_y_3 > 0
      ? (Math.pow(data.revenue_y_3 / data.revenue_y_1, 1 / 2) - 1) * 100
      : null;

  const { data: submission, error: sErr } = await service
    .from('submissions')
    .insert({
      user_id: user?.id ?? null,
      company_id: companyId,
      revenue_y_1: data.revenue_y_1,
      revenue_y_2: data.revenue_y_2,
      revenue_y_3: data.revenue_y_3,
      ebitda: data.ebitda,
      ebitda_margin_pct: ebitdaMargin,
      recurring_revenue_pct: data.recurring_revenue_pct,
      top3_client_concentration: data.top3_client_concentration,
      revenue_cagr_pct: revenueCagr,
      tech_investment_ratio_pct: data.tech_investment_ratio_pct,
      founder_dependency: data.founder_dependency,
      management_structure: data.management_structure,
      digital_maturity: data.digital_maturity,
      client_portfolio_quality: data.client_portfolio_quality,
      business_scalability: data.business_scalability,
      network_partnerships: data.network_partnerships,
    })
    .select('id')
    .single();

  if (sErr || !submission) {
    return { ok: false, error: sErr?.message ?? 'Could not save submission.' };
  }

  // ---------------------------------------------------------------------------
  // 4) Score and persist valuation.
  // ---------------------------------------------------------------------------
  let scoring;
  try {
    scoring = await runScoring(data, {
      peerGroupName,
      naceCode,
      supabase: service,
    });
  } catch (e) {
    return { ok: false, error: `Scoring failed: ${(e as Error).message}` };
  }

  const { error: vErr } = await service
    .from('valuations')
    .insert({
      user_id: user?.id ?? null,
      submission_id: submission.id,
      company_id: companyId,
      v_current_eur: scoring.valuation.v_current_eur,
      v_potential_eur: scoring.valuation.v_potential_eur,
      v_low_eur: scoring.valuation.v_low_eur,
      v_high_eur: scoring.valuation.v_high_eur,
      value_gap_pct: scoring.valuation.value_gap_pct,
      ebitda_norm: data.ebitda,
      m_sector: scoring.valuation.m_sector,
      sqf: scoring.composite.sqf,
      gf: scoring.growth.gf,
      quality_score: scoring.quality_score,
      risk_index: scoring.risk_index,
      scalability_index: scoring.scalability_index,
      cap_financial: scoring.capitals.financial,
      cap_technological: scoring.capitals.technological,
      cap_human: scoring.capitals.human,
      cap_relational: scoring.capitals.relational,
      flags: scoring.flags,
    });

  if (vErr) {
    return { ok: false, error: `Could not save valuation: ${vErr.message}` };
  }

  // ---------------------------------------------------------------------------
  // 5) Demo cookie for unauthenticated visitors; redirect to dashboard.
  // ---------------------------------------------------------------------------
  if (!user) {
    cookies().set(DEMO_COOKIE, submission.id, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  redirect(`/dashboard?submitted=${submission.id}`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ServiceClient = ReturnType<typeof createServiceClient>;

interface CreatedCompany {
  ok: true;
  id: string;
  nace_code: string | null;
}
type CreateCompanyResult = CreatedCompany | { ok: false; error: string };

async function createCompany(
  service: ServiceClient,
  userId: string | null,
  data: DiagnosticInput,
): Promise<CreateCompanyResult> {
  const naceCode = naceFromSector(data.sector);
  const name = userId ? 'My company' : 'Demo company';
  const { data: created, error } = await service
    .from('companies')
    .insert({
      user_id: userId,
      name,
      sector: data.sector,
      nace_code: naceCode,
      lifecycle_stage: data.lifecycle_stage,
      distinctive_assets: data.distinctive_assets || null,
      stated_objective: data.stated_objective,
      time_horizon: data.time_horizon,
    })
    .select('id, nace_code')
    .single();
  if (error || !created) {
    return { ok: false, error: error?.message ?? 'Could not create company.' };
  }
  return { ok: true, id: created.id, nace_code: created.nace_code };
}

/**
 * Map the high-level sector label from the diagnostic form to a 2-3 digit
 * NACE Rev. 2 code. The calibration set is concentrated in 28xx so the
 * Manufacturing default lands inside it; the others give the scoring
 * engine a sensible fallback even though we have less peer data for them.
 */
function naceFromSector(sector: DiagnosticInput['sector']): string {
  switch (sector) {
    case 'Manufacturing':            return '282';
    case 'Wholesale & Distribution': return '46';
    case 'Professional Services':    return '71';
    case 'Tech / Software':          return '62';
    case 'Retail / e-Commerce':      return '47';
    case 'Construction':             return '41';
    case 'Logistics':                return '49';
    case 'Other':                    return '00';
  }
}

/**
 * Pick the peer-group name and a NACE code we can use for percentile
 * lookups. Joins the diagnostic-form NACE code to `vip.context` and
 * picks the most common peer_group_name for that prefix.
 */
async function resolvePeerContext(
  service: ServiceClient,
  naceCode: string | null,
): Promise<{ peerGroupName: string | null; naceCode: string | null }> {
  if (!naceCode) return { peerGroupName: null, naceCode: null };

  const { data, error } = await service
    .from('context')
    .select('peer_group_name')
    .ilike('nace_rev_2', `${naceCode.slice(0, 3)}%`)
    .not('peer_group_name', 'is', null)
    .limit(50);

  if (error || !data || data.length === 0) {
    return { peerGroupName: null, naceCode };
  }

  // Pick the most common peer-group label in the sample.
  const counts = new Map<string, number>();
  for (const row of data) {
    const key = row.peer_group_name;
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [k, c] of counts) {
    if (c > bestCount) {
      best = k;
      bestCount = c;
    }
  }
  return { peerGroupName: best, naceCode };
}
