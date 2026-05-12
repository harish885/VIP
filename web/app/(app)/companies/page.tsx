import Link from 'next/link';
import { Search, Building2, MapPin, Users, TrendingUp } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/service';
import { searchCompanies, type AidaSnapshot } from '@/lib/aida';

export const metadata = { title: 'Companies · VIP' };
export const dynamic = 'force-dynamic';

/**
 * /companies
 *
 * Search-first entry point. Lists all 14 999 AIDA SMEs, narrowable by name.
 * The header search box submits via the standard GET-then-render pattern so
 * results stay shareable through URL.
 */
export default async function CompaniesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = (searchParams?.q ?? '').trim();
  const service = createServiceClient();
  const results = await searchCompanies(service, q, 30);

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-10">
      <div className="d-section mb-6">
        <h1 className="font-serif text-[36px] font-medium leading-tight tracking-tight">
          Find a company
        </h1>
        <p className="mt-2 text-[14px] text-text-dim">
          Search the AIDA calibration set — 14 999 Italian SMEs in NACE 28xx.
          Pick one to open its dashboard and run the strategic diagnostic.
        </p>
      </div>

      {/* Search box */}
      <form action="/companies" method="GET" className="d-section">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-faint"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            autoFocus
            placeholder="Search by company name…"
            className="w-full rounded-xl border border-line bg-bg-2/40 py-3.5 pl-11 pr-4 font-mono text-[13px] text-text placeholder:text-text-faint focus:border-cyan/40 focus:outline-none focus:ring-1 focus:ring-cyan/30"
          />
        </div>
        <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
          <span>{q ? `Results for "${q}"` : 'Top companies by latest revenue'}</span>
          <span>{results.length} shown</span>
        </div>
      </form>

      {/* Result grid */}
      <div className="d-section mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {results.length === 0 && (
          <div className="col-span-full rounded-2xl border border-line bg-bg-2/40 px-6 py-12 text-center text-[14px] text-text-dim">
            No companies match <span className="font-mono text-amber">{q || '(empty query)'}</span>.
            Try a shorter substring — AIDA names use “S.R.L.”, “S.P.A.” suffixes.
          </div>
        )}
        {results.map((c) => (
          <CompanyCard key={c.tax_code} c={c} />
        ))}
      </div>

      <div className="d-section mt-10 border-t border-line pt-4 font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
        Source: AIDA / Bureau van Dijk · Italian SMEs · last available year
      </div>
    </div>
  );
}

// =============================================================================
// Card
// =============================================================================
function CompanyCard({ c }: { c: AidaSnapshot }) {
  const revenueMnEUR = c.revenue_last_thk !== null ? c.revenue_last_thk / 1000 : null;
  const ebitdaMnEUR  = c.ebitda_last_thk  !== null ? c.ebitda_last_thk  / 1000 : null;

  return (
    <Link
      href={`/companies/${encodeURIComponent(c.tax_code)}`}
      className="group relative overflow-hidden rounded-2xl border border-line bg-bg-2/40 p-5 transition-all hover:-translate-y-0.5 hover:border-cyan/30 hover:bg-bg-2/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan/30 to-blue/30 text-cyan">
            <Building2 size={18} />
          </span>
          <div className="min-w-0">
            <div className="truncate font-mono text-[12.5px] font-semibold text-text">
              {c.company_name}
            </div>
            <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-text-faint">
              {c.province && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={9} /> {c.province}
                </span>
              )}
              {c.nace_rev_2 && <span>· NACE {c.nace_rev_2}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line-faint pt-3 font-mono">
        <CardStat
          label="Revenue"
          value={revenueMnEUR !== null ? `€${revenueMnEUR.toFixed(1)}M` : '—'}
        />
        <CardStat
          label="EBITDA"
          value={ebitdaMnEUR !== null ? `€${ebitdaMnEUR.toFixed(2)}M` : '—'}
        />
        <CardStat
          label="Margin"
          value={c.ebitda_margin_pct !== null ? `${c.ebitda_margin_pct.toFixed(1)}%` : '—'}
        />
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-[10px]">
        <span className="inline-flex items-center gap-1 text-text-faint">
          <Users size={9} /> {c.employees !== null ? Math.round(c.employees) : '—'} emp.
        </span>
        <span className="inline-flex items-center gap-1 text-cyan opacity-0 transition-opacity group-hover:opacity-100">
          Open dashboard <TrendingUp size={10} />
        </span>
      </div>
    </Link>
  );
}

function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-eyebrow text-text-faint">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[13px] font-semibold text-text">{value}</div>
    </div>
  );
}
