import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/service';
import { getUser } from '@/lib/auth';
import { getCompanySnapshot, type AidaSnapshot } from '@/lib/aida';
import { loadCompanyWorkspace, type CompanyWorkspaceData, type DiagnosisStatus } from '@/lib/company-loader';
import { fromValuationRow, type DashboardData } from '@/lib/dashboard-data';
import { CompanyWorkspace } from '@/components/company-workspace/workspace';
import { CompanyEmptyState } from '@/components/company-workspace/empty-state';
import { CompareView, type CompareSide } from '@/components/company-workspace/compare-view';
import { ComparePicker } from '@/components/companies/compare-picker';

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
  searchParams?: { submitted?: string; vs?: string };
}) {
  const taxCode = decodeURIComponent(params.taxCode);
  const service = createServiceClient();
  const snapshot = await getCompanySnapshot(service, taxCode);
  if (!snapshot) notFound();

  const submittedId = searchParams?.submitted ?? null;
  const cookieSubmissionId = cookies().get(`${COOKIE_PREFIX}${taxCode}`)?.value ?? null;
  const preferSubmissionId = submittedId ?? cookieSubmissionId;

  const user = await getUser();
  const workspace = await loadCompanyWorkspace(service, taxCode, {
    userId: user?.id ?? null,
    preferSubmissionId,
  });

  // Optional comparator (?vs=<taxCode>) — loaded server-side so the
  // comparison is shareable as a URL and never fakes missing data.
  const vsTaxCode = searchParams?.vs ? decodeURIComponent(searchParams.vs) : null;
  let compare: { a: CompareSide; b: CompareSide } | null = null;
  if (vsTaxCode && vsTaxCode !== taxCode) {
    const vsSnapshot = await getCompanySnapshot(service, vsTaxCode);
    if (vsSnapshot) {
      const vsWorkspace = await loadCompanyWorkspace(service, vsTaxCode, {
        userId: user?.id ?? null,
        preferSubmissionId: null,
      });
      compare = {
        a: { snapshot, taxCode, valuation: workspace?.valuation ?? null },
        b: { snapshot: vsSnapshot, taxCode: vsTaxCode, valuation: vsWorkspace?.valuation ?? null },
      };
    }
  }

  const compareStrip = (
    <div className="mx-auto mt-2 flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 pb-6 sm:px-6">
      <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
        Benchmark
      </div>
      <ComparePicker taxCode={taxCode} vsName={compare?.b.snapshot.company_name ?? null} />
    </div>
  );

  const compareBlock = compare && (
    <div className="mx-auto max-w-[1180px] px-4 pb-16 sm:px-6">
      <CompareView a={compare.a} b={compare.b} />
    </div>
  );

  if (!workspace) {
    return (
      <>
        <CompanyEmptyState snapshot={snapshot} taxCode={taxCode} />
        {compareStrip}
        {compareBlock}
      </>
    );
  }

  const data = workspaceToDashboardData(workspace, snapshot, Boolean(submittedId));
  return (
    <>
      <CompanyWorkspace
        data={data}
        snapshot={snapshot}
        taxCode={taxCode}
        status={workspace.status}
        lastRunISO={workspace.valuation.computed_at}
        freshSubmission={Boolean(submittedId)}
      />
      {compareStrip}
      {compareBlock}
    </>
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
