'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DiagnosticSchema, type DiagnosticInput } from '@/lib/diagnostic-schema';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getCompanySnapshot } from '@/lib/aida';
import {
  runScoring,
  buildRecommendations,
  buildScoringInput,
  computeValuation,
  getSectorMultiple,
} from '@/lib/scoring';

export type SubmitResult = { ok: true; submissionId?: string } | { ok: false; error: string };

const COOKIE_PREFIX = 'vip_company_submission_';

/**
 * submitCompanyDiagnosticAction
 *
 * Pivot-edition diagnostic submission. Pipeline:
 *
 *   1. Validate the questionnaire payload (Zod).
 *   2. Fetch the AIDA snapshot for the company by tax_code.
 *   3. Find / create the vip.companies row linked to that tax_code.
 *   4. Build the augmented ScoringInput (questionnaire + AIDA quant).
 *   5. Insert the submission row including the new 1–5 q_* columns.
 *   6. Run the scoring pipeline.
 *   7. Recompute V with the predicted Top-3 uplift sum so V_potential is
 *      consistent with the recommendations panel.
 *   8. Insert the valuation + the recommendations.
 *   9. Drop a per-company cookie so the dashboard can highlight the run.
 *  10. Redirect to /companies/[taxCode]?submitted=<id>.
 */
export async function submitCompanyDiagnosticAction(
  taxCode: string,
  input: DiagnosticInput,
): Promise<SubmitResult> {
  const parsed = DiagnosticSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message ?? 'Invalid submission.' };
  }
  const q = parsed.data;

  const service = createServiceClient();
  const snapshot = await getCompanySnapshot(service, taxCode);
  if (!snapshot) return { ok: false, error: `Company not found for tax code ${taxCode}.` };

  // Resolve user (optional — demo mode supported).
  const userClient = createClient();
  const { data: { user } } = await userClient.auth.getUser();

  // ---------------------------------------------------------------------------
  // 1. Find / create the company row linked to tax_code
  // ---------------------------------------------------------------------------
  const naceCode = snapshot.nace_rev_2 ?? null;
  const companyId = await ensureCompanyRow(service, {
    taxCode,
    snapshot,
    q,
    userId: user?.id ?? null,
    naceCode,
  });
  if (!companyId.ok) return { ok: false, error: companyId.error };

  // ---------------------------------------------------------------------------
  // 2. Build the scoring input + persist the submission
  // ---------------------------------------------------------------------------
  const scoringInput = buildScoringInput({ diagnostic: q, snapshot });

  const ebitdaMargin = scoringInput.revenue_y_3 > 0
    ? (scoringInput.ebitda / scoringInput.revenue_y_3) * 100
    : null;
  const revenueCagr = scoringInput.revenue_y_1 > 0 && scoringInput.revenue_y_3 > 0
    ? (Math.pow(scoringInput.revenue_y_3 / scoringInput.revenue_y_1, 1 / 2) - 1) * 100
    : null;

  const { data: submission, error: sErr } = await service
    .from('submissions')
    .insert({
      user_id: user?.id ?? null,
      company_id: companyId.id,
      // AIDA-derived quant snapshot frozen at submission time
      revenue_y_1: scoringInput.revenue_y_1,
      revenue_y_2: scoringInput.revenue_y_2,
      revenue_y_3: scoringInput.revenue_y_3,
      ebitda: scoringInput.ebitda,
      ebitda_margin_pct: ebitdaMargin,
      recurring_revenue_pct: scoringInput.recurring_revenue_pct,
      top3_client_concentration: scoringInput.top3_client_concentration,
      revenue_cagr_pct: revenueCagr,
      tech_investment_ratio_pct: scoringInput.tech_investment_ratio_pct,
      // 6 legacy qualitative columns (overlap with new questionnaire)
      founder_dependency: q.founder_dependency,
      management_structure: q.management_structure,
      digital_maturity: q.digital_maturity,
      client_portfolio_quality: q.client_portfolio_quality,
      business_scalability: q.business_scalability,
      network_partnerships: q.network_partnerships,
      // 8 new questionnaire columns
      q_automation: q.q_automation,
      q_enabling_systems: q.q_enabling_systems,
      q_distinctive_tech_assets: q.q_distinctive_tech_assets,
      q_process_maturity: q.q_process_maturity,
      q_transferability: q.q_transferability,
      q_strategic_partnerships: q.q_strategic_partnerships,
      q_reputation: q.q_reputation,
      q_quality_of_growth: q.q_quality_of_growth,
      q_lifecycle_score: q.q_lifecycle_score,
      q_distinctive_assets_score: q.q_distinctive_assets_score,
      q_ma_history: q.q_ma_history,
    })
    .select('id')
    .single();

  if (sErr || !submission) {
    return { ok: false, error: sErr?.message ?? 'Could not save submission.' };
  }

  // ---------------------------------------------------------------------------
  // 3. Run scoring + recommendations
  // ---------------------------------------------------------------------------
  let scoring;
  try {
    scoring = await runScoring(scoringInput, {
      peerGroupName: snapshot.peer_group_name,
      naceCode,
      supabase: service,
    });
  } catch (e) {
    return { ok: false, error: `Scoring failed: ${(e as Error).message}` };
  }

  const recommendations = buildRecommendations({ scoring, naceCode });
  const totalUpliftPct = recommendations.reduce((sum, r) => sum + r.v_uplift_pct, 0);

  const refined = computeValuation({
    ebitda_eur: scoringInput.ebitda,
    m_sector: getSectorMultiple({ naceCode, sector: scoringInput.sector }),
    sqf: scoring.composite.sqf,
    gf: scoring.growth.gf,
    top3_uplift_pct_sum: totalUpliftPct,
  });

  // ---------------------------------------------------------------------------
  // 4. Insert valuation + recommendations
  // ---------------------------------------------------------------------------
  const { data: valuationRow, error: vErr } = await service
    .from('valuations')
    .insert({
      user_id: user?.id ?? null,
      submission_id: submission.id,
      company_id: companyId.id,
      v_current_eur: refined.v_current_eur,
      v_potential_eur: refined.v_potential_eur,
      v_low_eur: refined.v_low_eur,
      v_high_eur: refined.v_high_eur,
      value_gap_pct: refined.value_gap_pct,
      ebitda_norm: scoringInput.ebitda,
      m_sector: refined.m_sector,
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
    })
    .select('id')
    .single();

  if (vErr || !valuationRow) {
    return { ok: false, error: `Could not save valuation: ${vErr?.message ?? 'unknown'}` };
  }

  if (recommendations.length > 0) {
    const recoRows = recommendations.map((r) => ({
      user_id: user?.id ?? null,
      valuation_id: valuationRow.id,
      rank: r.rank,
      title: r.title,
      description: r.description,
      capital_impact: r.capital_impact,
      v_uplift_pct: r.v_uplift_pct,
      rov_score: r.rov_score,
      time_horizon_months: r.time_to_impact_months,
    }));
    const { error: rErr } = await service.from('recommendations').insert(recoRows);
    if (rErr) {
      console.warn('[diagnostic] recommendations insert failed:', rErr.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Cookie + redirect
  // ---------------------------------------------------------------------------
  cookies().set(`${COOKIE_PREFIX}${taxCode}`, submission.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  });

  redirect(`/companies/${encodeURIComponent(taxCode)}?submitted=${submission.id}`);
}

// =============================================================================
// Helpers
// =============================================================================
type ServiceClient = ReturnType<typeof createServiceClient>;

interface EnsureCompanyArgs {
  taxCode: string;
  snapshot: { company_name: string; province: string | null; nace_rev_2: string | null };
  q: DiagnosticInput;
  userId: string | null;
  naceCode: string | null;
}

async function ensureCompanyRow(
  service: ServiceClient,
  { taxCode, snapshot, q, userId, naceCode }: EnsureCompanyArgs,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  // Re-use the same VIP company row across diagnostics for the same tax_code,
  // scoped by user when authenticated (so multiple users don't share state).
  let query = service
    .from('companies')
    .select('id')
    .eq('tax_code', taxCode)
    .order('created_at', { ascending: false })
    .limit(1);

  if (userId) query = query.eq('user_id', userId);
  else query = query.is('user_id', null);

  const { data: existing } = await query.maybeSingle();
  if (existing) return { ok: true, id: existing.id };

  const { data: created, error } = await service
    .from('companies')
    .insert({
      user_id: userId,
      tax_code: taxCode,
      name: snapshot.company_name,
      province: snapshot.province,
      nace_code: naceCode,
      sector: q.sector ?? 'Manufacturing',
      lifecycle_stage: q.lifecycle_stage ?? null,
      distinctive_assets: q.distinctive_assets || null,
      stated_objective: q.stated_objective,
      time_horizon: q.time_horizon,
    })
    .select('id')
    .single();

  if (error || !created) {
    return { ok: false, error: error?.message ?? 'Could not create company row.' };
  }
  return { ok: true, id: created.id };
}
