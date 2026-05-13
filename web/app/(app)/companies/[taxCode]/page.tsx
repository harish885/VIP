import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/service';
import { getCompanySnapshot, type AidaSnapshot } from '@/lib/aida';
import { loadCompanyWorkspace, type CompanyWorkspaceData, type DiagnosisStatus } from '@/lib/company-loader';
import { fromValuationRow, type DashboardData } from '@/lib/dashboard-data';
import { CompanyWorkspace } from '@/components/company-workspace/workspace';
import { CompanyEmptyState } from '@/components/company-workspace/empty-state';

export const metadata = { title: 'Company · VIP' };
export const dynamic = 'force-dynamic';

const COOKIE_PREFIX = 'vip_company_submission_';

/**
 * /companies/[taxCode]
 *
 * Per-company workspace. Three render paths:
 *   1. Just submitted (?submitted=<submission_id>) → load that exact valuation
 *      (verified against the company's tax_code so a stale cookie can't poison it).
 *   2. Latest valuation we have on file for the tax_code → render the workspace.
 *   3. No valuation yet → empty state with AIDA snapshot and a "Run diagnostic"
 *      invitation.
 */
export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: { taxCode: string };
  searchParams?: { submitted?: string };
}) {
  const taxCode = decodeURIComponent(params.taxCode);
  const service = createServiceClient();
  const snapshot = await getCompanySnapshot(service, taxCode);
  if (!snapshot) notFound();

  const submittedId = searchParams?.submitted ?? null;
  const cookieSubmissionId = cookies().get(`${COOKIE_PREFIX}${taxCode}`)?.value ?? null;
  const preferSubmissionId = submittedId ?? cookieSubmissionId;

  const workspace = await loadCompanyWorkspace(service, taxCode, preferSubmissionId);

  if (!workspace) {
    return <CompanyEmptyState snapshot={snapshot} taxCode={taxCode} />;
  }

  const data = workspaceToDashboardData(workspace, snapshot, Boolean(submittedId));
  return (
    <CompanyWorkspace
      data={data}
      taxCode={taxCode}
      status={workspace.status}
      lastRunISO={workspace.valuation.computed_at}
      freshSubmission={Boolean(submittedId)}
    />
  );
}

function workspaceToDashboardData(
  workspace: CompanyWorkspaceData,
  snapshot: AidaSnapshot,
  highlight: boolean,
): DashboardData {
  return fromValuationRow({
    company: {
      name: workspace.company.name || snapshot.company_name,
      sector: workspace.company.sector ?? null,
      nace_code: workspace.company.nace_code ?? snapshot.nace_rev_2,
      province: workspace.company.province ?? snapshot.province,
      lifecycle_stage: workspace.company.lifecycle_stage,
      distinctive_assets: workspace.company.distinctive_assets,
      stated_objective: workspace.company.stated_objective,
      time_horizon: workspace.company.time_horizon,
    },
    valuation: workspace.valuation,
    submission: workspace.submission,
    recommendations: workspace.recommendations,
    submittedHighlight: highlight,
  });
}

// `DiagnosisStatus` is exported here just so the workspace import stays neat.
export type { DiagnosisStatus };
