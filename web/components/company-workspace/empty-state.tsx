import Link from 'next/link';
import { ArrowLeft, ArrowRight, MapPin, PenLine } from 'lucide-react';
import type { AidaSnapshot } from '@/lib/aida';
import { InfoButton, type Explanation } from '@/components/company-workspace/info-popover';

/**
 * Rendered when a company exists in AIDA but no valuation has been
 * computed yet. AIDA factsheet is shown for context; the primary
 * action is to start the diagnostic.
 */
export function CompanyEmptyState({
  snapshot,
  taxCode,
}: {
  snapshot: AidaSnapshot;
  taxCode: string;
}) {
  const cards: Array<{ label: string; value: string; sub: string; info: Explanation }> = [
    {
      label: 'Revenue (last)',
      value: money(snapshot.revenue_last_thk, 1),
      sub: 'Three-year history available',
      info: {
        title: 'Revenue (last available year)',
        source: 'AIDA / Bureau van Dijk — official financial statements',
        steps: [
          { label: 'Company', value: snapshot.company_name },
          { label: 'Tax code', value: snapshot.tax_code },
          { label: 'Revenue (last)', value: thkOrDash(snapshot.revenue_last_thk) },
          { label: 'Revenue 2024', value: thkOrDash(snapshot.revenue_2024_thk) },
          { label: 'Revenue 2023', value: thkOrDash(snapshot.revenue_2023_thk) },
          { label: 'Revenue 2022', value: thkOrDash(snapshot.revenue_2022_thk) },
          { note: 'Reported in thousands of EUR by AIDA. Sourced directly from company filings — not estimated.' },
        ],
        result: money(snapshot.revenue_last_thk, 1),
      },
    },
    {
      label: 'EBITDA',
      value: money(snapshot.ebitda_last_thk, 2),
      sub: snapshot.ebitda_margin_pct !== null
        ? `Margin ${snapshot.ebitda_margin_pct.toFixed(1)}%`
        : '—',
      info: {
        title: 'EBITDA (last available year)',
        source: 'AIDA / Bureau van Dijk — official financial statements',
        steps: [
          { label: 'EBITDA (last)', value: thkOrDash(snapshot.ebitda_last_thk) },
          { label: 'EBITDA 2024', value: thkOrDash(snapshot.ebitda_2024_thk) },
          { label: 'EBITDA 2023', value: thkOrDash(snapshot.ebitda_2023_thk) },
          { label: 'EBITDA 2022', value: thkOrDash(snapshot.ebitda_2022_thk) },
          { label: 'Margin', value: snapshot.ebitda_margin_pct != null ? `${snapshot.ebitda_margin_pct.toFixed(1)}%` : '—', note: 'EBITDA ÷ Revenue, as reported in AIDA.' },
        ],
        result: money(snapshot.ebitda_last_thk, 2),
      },
    },
    {
      label: 'Employees',
      value: snapshot.employees !== null ? Math.round(snapshot.employees).toString() : '—',
      sub: snapshot.turnover_per_employee_eur !== null
        ? `€${Math.round(snapshot.turnover_per_employee_eur).toLocaleString()} / head`
        : '—',
      info: {
        title: 'Employees',
        source: 'AIDA / Bureau van Dijk — employee headcount',
        steps: [
          { label: 'Headcount', value: snapshot.employees != null ? Math.round(snapshot.employees).toString() : '—' },
          { label: 'Turnover / employee', value: snapshot.turnover_per_employee_eur != null ? `€${Math.round(snapshot.turnover_per_employee_eur).toLocaleString()}` : '—',
            note: 'Last reported revenue ÷ headcount — a labour-productivity proxy.' },
          { label: 'Directors / managers', value: snapshot.director_manager_count != null ? String(snapshot.director_manager_count) : '—' },
        ],
        result: snapshot.employees != null ? Math.round(snapshot.employees).toString() : '—',
      },
    },
    {
      label: 'Net financial position',
      value: money(snapshot.net_financial_position_thk, 2),
      sub: snapshot.debt_ebitda_ratio !== null
        ? `Debt / EBITDA ${snapshot.debt_ebitda_ratio.toFixed(1)}×`
        : '—',
      info: {
        title: 'Net financial position',
        source: 'AIDA / Bureau van Dijk — balance sheet',
        steps: [
          { label: 'NFP (last)', value: thkOrDash(snapshot.net_financial_position_thk),
            note: 'Financial debt minus cash & marketable securities. Negative = net cash.' },
          { label: 'Debt / EBITDA', value: snapshot.debt_ebitda_ratio != null ? `${snapshot.debt_ebitda_ratio.toFixed(1)}×` : '—',
            note: 'Years of EBITDA needed to repay net debt — a fragility signal above 3×.' },
          { label: 'Operating cash flow', value: thkOrDash(snapshot.operating_cash_flow_thk) },
        ],
        result: money(snapshot.net_financial_position_thk, 2),
      },
    },
  ];

  return (
    <div className="mx-auto max-w-[1140px] px-6 pb-16 pt-6">
      <div className="mb-5">
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-text-dim"
        >
          <ArrowLeft size={13} /> All companies
        </Link>
      </div>

      <section className="rounded-2xl border border-line bg-bg-1 p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center rounded-full border border-text-faint/40 bg-bg-2/60 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
              Not diagnosed
            </div>
            <h1 className="mt-3 max-w-[640px] font-serif text-[34px] font-medium leading-[1.05] tracking-tight text-text">
              {snapshot.company_name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-text-dim">
              {snapshot.province && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={12} /> {snapshot.province}
                </span>
              )}
              {snapshot.nace_rev_2 && (
                <>
                  <Dot /> <span>NACE {snapshot.nace_rev_2}</span>
                </>
              )}
              {snapshot.size_estimate && (
                <>
                  <Dot /> <span>{snapshot.size_estimate}</span>
                </>
              )}
              <Dot />
              <span className="font-mono text-[11px] text-text-faint">Tax · {taxCode}</span>
            </div>
          </div>
          <Link
            href={`/companies/${encodeURIComponent(taxCode)}/diagnostic`}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-md border border-gold/50 bg-gold/[0.10] px-4 py-2 text-[12.5px] font-semibold text-gold transition-colors hover:bg-gold/[0.18]"
          >
            <PenLine size={14} /> Run diagnostic
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ label, value, sub, info }) => (
            <div key={label} className="bg-bg-1 px-5 py-4">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
                <span>{label}</span>
                <InfoButton explanation={info} ariaLabel={`How ${label} is sourced`} />
              </div>
              <div className="mt-2 font-serif text-[24px] font-medium leading-none tracking-tight text-text">
                {value}
              </div>
              <div className="mt-1.5 text-[12px] text-text-dim">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-bg-1 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <h3 className="font-serif text-[18px] font-medium text-text">
          Bring this company to life.
        </h3>
        <p className="mt-1 max-w-[640px] text-[13.5px] leading-relaxed text-text-dim">
          The AIDA factsheet above is the public picture. Answer the 19-question
          diagnostic to get a strategic valuation, a four-capital scorecard, a
          top-three action plan, and an interactive scenario lab. Takes about
          five minutes.
        </p>
        <Link
          href={`/companies/${encodeURIComponent(taxCode)}/diagnostic`}
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold hover:underline"
        >
          Start the diagnostic <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}

function Dot() {
  return <span className="text-text-faint">·</span>;
}

function money(thk: number | null, decimals = 1): string {
  if (thk === null) return '—';
  const m = thk / 1000;
  if (m >= 1) return `€${m.toFixed(decimals)}M`;
  return `€${Math.round(thk).toLocaleString()}K`;
}

function thkOrDash(v: number | null | undefined): string {
  if (v == null) return '—';
  return `€${Math.round(v).toLocaleString()}K`;
}
