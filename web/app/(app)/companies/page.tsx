import Link from 'next/link';
import { ArrowRight, AlertTriangle, MapPin } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase/service';
import { searchCompanies, type AidaSnapshot } from '@/lib/aida';
import { SearchBar } from '@/components/companies/search-bar';
import {
  loadLatestComputedAtByTaxCode,
  diagnosisStatusFor,
  type DiagnosisStatus,
} from '@/lib/company-loader';

export const metadata = { title: 'Companies · VIP' };
export const dynamic = 'force-dynamic';

/**
 * /companies — search workspace.
 *
 * Typeahead search dropdown handles "find by name". The page also
 * shows a compact list (top 20 by latest revenue, or filtered by ?q=)
 * so users can browse and so server rendering still works without JS.
 *
 * Each row carries a diagnosis status badge derived from the latest
 * valuation associated with that tax_code.
 */
export default async function CompaniesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = (searchParams?.q ?? '').trim();
  const service = createServiceClient();

  // We don't want a static top-N list on first visit — only fetch when the
  // user actually queries. The typeahead still handles in-place suggestions
  // for any partial input via /api/companies/search.
  const outcome = q.length > 0
    ? await searchCompanies(service, q, 20)
    : { ok: true as const, results: [] };
  const results = outcome.ok ? outcome.results : [];
  const setupError = outcome.ok ? null : outcome;

  const statusMap = await loadLatestComputedAtByTaxCode(
    service,
    results.map((r) => r.tax_code),
  );

  return (
    <div className="mx-auto max-w-[1080px] px-6 pb-16 pt-8">
      <header className="max-w-[640px]">
        <h1 className="font-serif text-[34px] font-medium leading-[1.05] tracking-tight text-text">
          Pick a company to value.
        </h1>
        <p className="mt-2 text-[14px] text-text-dim">
          Search the AIDA calibration set — 14&nbsp;999 Italian SMEs. Open one
          to see its strategic picture, or run the diagnostic to score it.
        </p>
      </header>

      {setupError && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber/40 bg-amber/[0.08] px-4 py-3 text-[13px] text-amber">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold">Database setup incomplete</div>
            <div className="mt-1 text-text-dim">{setupError.message}</div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <SearchBar initialQuery={q} />
      </div>

      {q.length > 0 && (
        <>
          <div className="mt-2 flex items-center justify-between text-[11.5px] text-text-faint">
            <span>Showing matches for &quot;{q}&quot;</span>
            <span>{results.length} of 14 999</span>
          </div>

          <ul className="mt-4 overflow-hidden rounded-2xl border border-line bg-bg-1 divide-y divide-line-faint">
            {results.length === 0 ? (
              <li className="px-6 py-10 text-center text-[13px] text-text-dim">
                No companies match <span className="font-mono text-amber">{q}</span>. Try a shorter substring — AIDA names use &ldquo;S.R.L.&rdquo;, &ldquo;S.P.A.&rdquo; suffixes.
              </li>
            ) : (
              results.map((c) => (
                <CompanyRow
                  key={c.tax_code}
                  c={c}
                  status={diagnosisStatusFor(statusMap.get(c.tax_code) ?? null)}
                />
              ))
            )}
          </ul>
        </>
      )}

      {q.length === 0 && !setupError && (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-bg-2/30 px-6 py-12 text-center">
          <p className="text-[13.5px] text-text-dim">
            Start typing in the search box above to find a company by name.
          </p>
          <p className="mt-1 text-[12px] text-text-faint">
            14 999 Italian SMEs in NACE 28xx are indexed.
          </p>
        </div>
      )}

      <p className="mt-6 font-mono text-[10px] uppercase tracking-eyebrow text-text-faint">
        Source · AIDA / Bureau van Dijk · Italian SMEs · last available year
      </p>
    </div>
  );
}

// =============================================================================
function CompanyRow({ c, status }: { c: AidaSnapshot; status: DiagnosisStatus }) {
  return (
    <li>
      <Link
        href={`/companies/${encodeURIComponent(c.tax_code)}`}
        className="group flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-bg-2/50"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[14px] font-medium text-text">
              {c.company_name}
            </span>
            <StatusPill status={status} />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-text-faint">
            {c.province && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={10} /> {c.province}
              </span>
            )}
            {c.nace_rev_2 && <span>NACE {c.nace_rev_2}</span>}
            {c.ateco_2007_description && (
              <span className="max-w-[260px] truncate">{c.ateco_2007_description}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-baseline gap-5 text-right">
          <Metric label="Revenue" value={mEUR(c.revenue_last_thk, 1, 'M')} />
          <Metric label="EBITDA" value={mEUR(c.ebitda_last_thk, 2, 'M')} />
          <Metric
            label="Margin"
            value={c.ebitda_margin_pct !== null ? `${c.ebitda_margin_pct.toFixed(1)}%` : '—'}
          />
        </div>
        <ArrowRight
          size={14}
          className="shrink-0 text-text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-text-dim"
        />
      </Link>
    </li>
  );
}

function StatusPill({ status }: { status: DiagnosisStatus }) {
  const map: Record<DiagnosisStatus, { label: string; cls: string }> = {
    not_diagnosed: { label: 'Not diagnosed', cls: 'border-text-faint/40 bg-bg-2/60 text-text-faint' },
    diagnosed:     { label: 'Diagnosed',     cls: 'border-cyan/40 bg-cyan/[0.07] text-cyan' },
    recent:        { label: 'Updated',       cls: 'border-green/40 bg-green/[0.07] text-green' },
  };
  if (status === 'not_diagnosed') return null;
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-eyebrow ${cls}`}
    >
      {label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9.5px] uppercase tracking-eyebrow text-text-faint">{label}</div>
      <div className="mt-0.5 font-mono text-[13px] font-semibold text-text">{value}</div>
    </div>
  );
}

function mEUR(thk: number | null, decimals: number, suffix: 'M' | 'K'): string {
  if (thk === null) return '—';
  const eur = thk * 1000;
  if (suffix === 'M') return `€${(eur / 1_000_000).toFixed(decimals)}M`;
  return `€${Math.round(eur / 1000).toLocaleString()}K`;
}
