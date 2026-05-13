import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Building2, PenLine, TrendingUp } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/service';
import { getCompanySnapshot, type AidaSnapshot } from '@/lib/aida';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { fromValuationRow, type DashboardData } from '@/lib/dashboard-data';

export const metadata = { title: 'Company · VIP' };
export const dynamic = 'force-dynamic';

/**
 * /companies/[taxCode]
 *
 * Per-company entry point. Shows:
 *   · the AIDA factsheet (always available, comes from vip.aida_company_snapshot)
 *   · the latest VIP valuation if a diagnostic has already been run; otherwise
 *     a "Run diagnostic" CTA wired to /companies/[taxCode]/diagnostic.
 *
 * The dashboard view is the same React component used elsewhere — we just
 * feed it a `DashboardData` built from either real valuation rows or, when
 * no diagnostic has been run yet, an AIDA-only factsheet.
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

  // Has a VIP user-side company row already been created and scored?
  const { data: existing } = await service
    .from('companies')
    .select('id')
    .eq('tax_code', taxCode)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let dashboardData: DashboardData | null = null;
  let hasValuation = false;
  let companyId: string | null = existing?.id ?? null;

  if (companyId) {
    const dash = await loadDashboardForCompany(service, companyId, snapshot, Boolean(searchParams?.submitted));
    if (dash) {
      dashboardData = dash;
      hasValuation = true;
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8">
      {/* Back link */}
      <div className="d-section mb-4">
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-eyebrow text-text-faint transition-colors hover:text-text"
        >
          <ArrowLeft size={11} /> All companies
        </Link>
      </div>

      {/* AIDA factsheet — always visible above the dashboard */}
      <AidaFactsheet snapshot={snapshot} hasValuation={hasValuation} taxCode={taxCode} />

      {/* Dashboard — real numbers if we have a valuation, otherwise placeholder */}
      {dashboardData ? (
        <DashboardView data={dashboardData} />
      ) : (
        <NoDiagnosticState taxCode={taxCode} snapshot={snapshot} />
      )}
    </div>
  );
}

// =============================================================================
// AIDA factsheet header
// =============================================================================
function AidaFactsheet({
  snapshot,
  hasValuation,
  taxCode,
}: {
  snapshot: AidaSnapshot;
  hasValuation: boolean;
  taxCode: string;
}) {
  const initials = initialsFor(snapshot.company_name);
  return (
    <section className="d-section flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-bg-2/40 p-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-[54px] w-[54px] items-center justify-center rounded-[13px] bg-gradient-to-br from-cyan to-blue font-serif text-[20px] font-semibold text-white"
          style={{ boxShadow: '0 6px 22px rgba(21, 127, 137, 0.18)' }}
        >
          {initials}
        </div>
        <div>
          <h1 className="font-serif text-[26px] font-medium leading-tight tracking-tight">
            {snapshot.company_name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-text-dim">
            {snapshot.province && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={11} /> {snapshot.province}
              </span>
            )}
            {snapshot.nace_rev_2 && <><span className="text-text-faint">·</span><span>NACE {snapshot.nace_rev_2}</span></>}
            {snapshot.ateco_2007_description && (
              <>
                <span className="text-text-faint">·</span>
                <span className="max-w-[420px] truncate">{snapshot.ateco_2007_description}</span>
              </>
            )}
            {snapshot.size_estimate && (
              <>
                <span className="text-text-faint">·</span>
                <span>{snapshot.size_estimate}</span>
              </>
            )}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
            Tax code · {taxCode}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/companies/${encodeURIComponent(taxCode)}/diagnostic`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan/30 bg-cyan/[0.10] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-eyebrow text-cyan transition-all hover:-translate-y-0.5 hover:bg-cyan/[0.18]"
        >
          <PenLine size={12} strokeWidth={2.25} />
          {hasValuation ? 'Re-run diagnostic' : 'Run diagnostic'}
        </Link>
      </div>
    </section>
  );
}

// =============================================================================
// No-diagnostic placeholder (still shows the AIDA quant deck)
// =============================================================================
function NoDiagnosticState({
  taxCode,
  snapshot,
}: {
  taxCode: string;
  snapshot: AidaSnapshot;
}) {
  const cards: Array<[string, string, string]> = [
    [
      'Revenue (last)',
      snapshot.revenue_last_thk !== null
        ? `€${(snapshot.revenue_last_thk / 1000).toFixed(1)}M`
        : '—',
      `2024: ${snapshot.revenue_2024_thk !== null ? `€${(snapshot.revenue_2024_thk / 1000).toFixed(1)}M` : '—'}`,
    ],
    [
      'EBITDA',
      snapshot.ebitda_last_thk !== null
        ? `€${(snapshot.ebitda_last_thk / 1000).toFixed(2)}M`
        : '—',
      `Margin: ${snapshot.ebitda_margin_pct !== null ? `${snapshot.ebitda_margin_pct.toFixed(1)}%` : '—'}`,
    ],
    [
      'Employees',
      snapshot.employees !== null ? Math.round(snapshot.employees).toString() : '—',
      `Turnover/employee: ${snapshot.turnover_per_employee_eur !== null ? `€${Math.round(snapshot.turnover_per_employee_eur).toLocaleString()}` : '—'}`,
    ],
    [
      'Net financial position',
      snapshot.net_financial_position_thk !== null
        ? `€${(snapshot.net_financial_position_thk / 1000).toFixed(2)}M`
        : '—',
      `Debt/EBITDA: ${snapshot.debt_ebitda_ratio !== null ? `${snapshot.debt_ebitda_ratio.toFixed(1)}×` : '—'}`,
    ],
  ];

  return (
    <section className="d-section mt-6">
      <div className="rounded-2xl border border-line bg-bg-2/40 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
            AIDA factsheet · last available year
          </h3>
          <span className="font-mono text-[10px] text-text-faint">
            Bureau van Dijk
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {cards.map(([label, value, sub]) => (
            <div key={label} className="rounded-xl border border-line bg-bg-2/60 p-4">
              <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
                {label}
              </div>
              <div className="mt-1.5 font-mono text-[22px] font-bold tracking-tight text-text">
                {value}
              </div>
              <div className="mt-1 font-mono text-[10.5px] text-text-faint">{sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-gold/30 bg-gold/[0.06] p-6">
        <div>
          <h3 className="font-serif text-[20px] font-medium text-text">No diagnostic run yet.</h3>
          <p className="mt-1 max-w-[640px] text-[13.5px] text-text-dim">
            The AIDA factsheet above is the public picture. To get the full
            Value Intelligence dashboard — quality score, risk index, 4-capital
            radar, Top-3 actions and a live simulation — answer the 20-question
            qualitative diagnostic. Takes ~5 minutes.
          </p>
        </div>
        <Link
          href={`/companies/${encodeURIComponent(taxCode)}/diagnostic`}
          className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/[0.18] px-5 py-3 font-mono text-[12px] font-bold uppercase tracking-eyebrow text-gold transition-all hover:-translate-y-0.5 hover:bg-gold/[0.28]"
        >
          <TrendingUp size={14} /> Run diagnostic
        </Link>
      </div>
    </section>
  );
}

// =============================================================================
// Load dashboard data when a valuation exists for this company
// =============================================================================
type ServiceClient = ReturnType<typeof createServiceClient>;

async function loadDashboardForCompany(
  service: ServiceClient,
  companyId: string,
  snapshot: AidaSnapshot,
  highlight: boolean,
): Promise<DashboardData | null> {
  const { data: valRow } = await service
    .from('valuations')
    .select(
      `id, submission_id, company_id, v_current_eur, v_low_eur, v_high_eur,
       v_potential_eur, value_gap_pct, ebitda_norm, m_sector, sqf, gf,
       quality_score, risk_index, scalability_index,
       cap_financial, cap_technological, cap_human, cap_relational, flags`,
    )
    .eq('company_id', companyId)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!valRow) return null;

  const { data: company } = await service
    .from('companies')
    .select(
      `name, sector, nace_code, province, lifecycle_stage,
       distinctive_assets, stated_objective, time_horizon`,
    )
    .eq('id', companyId)
    .single();

  const { data: submission } = await service
    .from('submissions')
    .select(
      `revenue_y_1, revenue_y_2, revenue_y_3, ebitda,
       recurring_revenue_pct, top3_client_concentration, tech_investment_ratio_pct,
       founder_dependency, management_structure, digital_maturity,
       client_portfolio_quality, business_scalability, network_partnerships`,
    )
    .eq('id', valRow.submission_id)
    .single();

  const { data: recommendations } = await service
    .from('recommendations')
    .select('rank, title, description, capital_impact, v_uplift_pct, time_horizon_months')
    .eq('valuation_id', valRow.id)
    .order('rank', { ascending: true });

  return fromValuationRow({
    company: company ?? {
      name: snapshot.company_name,
      sector: 'Manufacturing',
      nace_code: snapshot.nace_rev_2,
      province: snapshot.province,
      lifecycle_stage: null,
    },
    valuation: valRow,
    submission: submission ?? null,
    recommendations: recommendations ?? [],
    submittedHighlight: highlight,
  });
}

// =============================================================================
// Helpers
// =============================================================================
function initialsFor(name: string): string {
  const cleaned = name.replace(/S\.R\.L\.|S\.P\.A\.|LTD|LLC|GMBH|SRL|SPA/gi, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '?';
  const second = parts[1]?.[0] ?? '';
  return (first + second).toUpperCase();
}
