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
  // 2. Capture the raw AIDA snapshot quant separately from the effective
  //    values the scoring engine consumed. Three sets live on every row:
  //      · aida_*    — raw snapshot at submission time (audit baseline)
  //      · override_* — user-entered values (when overrides_enabled)
  //      · legacy `revenue_y_*`, `ebitda`, … — *effective* values used by
  //        scoring (override → AIDA → proxy, in that priority).
  //    With this split each valuation is fully reproducible.
  // ---------------------------------------------------------------------------
  const aidaSnapshotQuant = aidaSnapshotInputs(snapshot);
  const aidaOnlyScoring = buildScoringInput({
    diagnostic: q,
    snapshot,
    overrides: null,
  });

  const scoringInput = buildScoringInput({
    diagnostic: q,
    snapshot,
    overrides: q.overrides,
  });

  const ebitdaMargin = scoringInput.revenue_y_3 > 0
    ? (scoringInput.ebitda / scoringInput.revenue_y_3) * 100
    : null;
  const revenueCagr = scoringInput.revenue_y_1 > 0 && scoringInput.revenue_y_3 > 0
    ? (Math.pow(scoringInput.revenue_y_3 / scoringInput.revenue_y_1, 1 / 2) - 1) * 100
    : null;

  // Qualitative columns persist NULL when the question was marked
  // "not relevant". Postgres CHECK BETWEEN 1 AND 5 passes for NULL.
  const excluded = new Set(q.excluded_questions ?? []);
  const persistLikert = (key: string, value: number | null | undefined): number | null =>
    excluded.has(key) ? null : (value ?? null);

  const overrides = q.overrides ?? { enabled: false };
  const overrideNum = (v: unknown): number | null =>
    typeof v === 'number' && !Number.isNaN(v) ? v : null;

  const { data: submission, error: sErr } = await service
    .from('submissions')
    .insert({
      user_id: user?.id ?? null,
      company_id: companyId.id,
      // EFFECTIVE quant — what the scoring engine actually consumed
      // (override → AIDA → proxy resolved by buildScoringInput).
      revenue_y_1: scoringInput.revenue_y_1,
      revenue_y_2: scoringInput.revenue_y_2,
      revenue_y_3: scoringInput.revenue_y_3,
      ebitda: scoringInput.ebitda,
      ebitda_margin_pct: ebitdaMargin,
      recurring_revenue_pct: scoringInput.recurring_revenue_pct,
      top3_client_concentration: scoringInput.top3_client_concentration,
      revenue_cagr_pct: revenueCagr,
      tech_investment_ratio_pct: scoringInput.tech_investment_ratio_pct,
      // RAW AIDA snapshot — never mutated by overrides. Audit baseline.
      aida_revenue_y_1:               aidaSnapshotQuant.revenue_y_1,
      aida_revenue_y_2:               aidaSnapshotQuant.revenue_y_2,
      aida_revenue_y_3:               aidaSnapshotQuant.revenue_y_3,
      aida_ebitda:                    aidaSnapshotQuant.ebitda,
      aida_ebitda_margin_pct:         aidaSnapshotQuant.ebitda_margin_pct,
      // AIDA does not carry these two directly today — store the bridge's
      // Q-proxied value (computed without user overrides) so the audit
      // trail still reflects "what AIDA + the questionnaire alone would
      // have produced".
      aida_recurring_revenue_pct:     aidaOnlyScoring.recurring_revenue_pct,
      aida_top3_client_concentration: aidaOnlyScoring.top3_client_concentration,
      aida_tech_investment_ratio_pct: aidaSnapshotQuant.tech_investment_ratio_pct,
      // User-entered overrides — raw, before being applied to scoringInput.
      overrides_enabled: Boolean(overrides.enabled),
      override_revenue_y_1: overrideNum(overrides.revenue_y_1),
      override_revenue_y_2: overrideNum(overrides.revenue_y_2),
      override_revenue_y_3: overrideNum(overrides.revenue_y_3),
      override_ebitda: overrideNum(overrides.ebitda),
      override_recurring_revenue_pct: overrideNum(overrides.recurring_revenue_pct),
      override_top3_client_concentration: overrideNum(overrides.top3_client_concentration),
      override_tech_investment_ratio_pct: overrideNum(overrides.tech_investment_ratio_pct),
      // Questions the user explicitly marked "not relevant"
      excluded_questions: q.excluded_questions ?? [],
      // 6 legacy qualitative columns (overlap with new questionnaire)
      founder_dependency:        persistLikert('founder_dependency',        q.founder_dependency),
      management_structure:      persistLikert('management_structure',      q.management_structure),
      digital_maturity:          persistLikert('digital_maturity',          q.digital_maturity),
      client_portfolio_quality:  persistLikert('client_portfolio_quality',  q.client_portfolio_quality),
      business_scalability:      persistLikert('business_scalability',      q.business_scalability),
      network_partnerships:      persistLikert('network_partnerships',      q.network_partnerships),
      // 11 newer questionnaire columns
      q_automation:               persistLikert('q_automation',               q.q_automation),
      q_enabling_systems:         persistLikert('q_enabling_systems',         q.q_enabling_systems),
      q_distinctive_tech_assets:  persistLikert('q_distinctive_tech_assets',  q.q_distinctive_tech_assets),
      q_process_maturity:         persistLikert('q_process_maturity',         q.q_process_maturity),
      q_transferability:          persistLikert('q_transferability',          q.q_transferability),
      q_strategic_partnerships:   persistLikert('q_strategic_partnerships',   q.q_strategic_partnerships),
      q_reputation:               persistLikert('q_reputation',               q.q_reputation),
      q_quality_of_growth:        persistLikert('q_quality_of_growth',        q.q_quality_of_growth),
      q_lifecycle_score:          persistLikert('q_lifecycle_score',          q.q_lifecycle_score),
      q_distinctive_assets_score: persistLikert('q_distinctive_assets_score', q.q_distinctive_assets_score),
      q_ma_history:               persistLikert('q_ma_history',               q.q_ma_history),
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

// =============================================================================
// AIDA snapshot quant extraction — separate from buildScoringInput so the
// raw baseline persists on the submission row even when overrides win.
// =============================================================================
import type { AidaSnapshot } from '@/lib/aida';

interface AidaQuantSnapshot {
  revenue_y_1: number | null;
  revenue_y_2: number | null;
  revenue_y_3: number | null;
  ebitda: number | null;
  ebitda_margin_pct: number | null;
  /** R&D / revenue ratio derived from AIDA. NULL when AIDA does not report R&D. */
  tech_investment_ratio_pct: number | null;
}

function aidaSnapshotInputs(s: AidaSnapshot): AidaQuantSnapshot {
  const revLast = thkToEur(s.revenue_last_thk);
  const rev2024 = thkToEur(s.revenue_2024_thk) || revLast;
  const rev2023 = thkToEur(s.revenue_2023_thk) || rev2024;
  const rev2022 = thkToEur(s.revenue_2022_thk) || rev2023;
  const y3 = revLast || rev2024 || rev2023 || rev2022 || null;
  const y2 = rev2023 || y3;
  const y1 = rev2022 || y2;
  const ebitda = thkToEur(s.ebitda_last_thk) || thkToEur(s.ebitda_2024_thk) || null;
  const margin =
    s.ebitda_margin_pct != null
      ? s.ebitda_margin_pct
      : ebitda != null && y3 != null && y3 > 0
        ? (ebitda / y3) * 100
        : null;
  const rd =
    s.rd_expense_thk != null && y3 != null && y3 > 0
      ? (s.rd_expense_thk * 1000 / y3) * 100
      : null;
  return {
    revenue_y_1: y1 != null ? Math.round(y1) : null,
    revenue_y_2: y2 != null ? Math.round(y2) : null,
    revenue_y_3: y3 != null ? Math.round(y3) : null,
    ebitda: ebitda != null ? Math.round(ebitda) : null,
    ebitda_margin_pct: margin != null ? round1(margin) : null,
    tech_investment_ratio_pct: rd != null ? round1(rd) : null,
  };
}

function thkToEur(n: number | null | undefined): number {
  return n == null ? 0 : n * 1000;
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
