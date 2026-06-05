import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { AidaSnapshot } from '@/lib/aida';
import type { ValuationRecord } from '@/lib/company-loader';
import { CapitalGlyph } from '@/components/cockpit/capital-glyph';
import { Surface } from '@/components/vip-ui/surface';
import { SourceBadge } from '@/components/vip-ui/source-badge';
import { formatEurCompact, formatPercent, thkToEur } from '@/lib/format';
import { industryFromNace } from '@/lib/industry';
import { cn } from '@/lib/cn';

export interface CompareSide {
  snapshot: AidaSnapshot;
  taxCode: string;
  valuation: ValuationRecord | null;
}

/**
 * CompareView — two companies, side by side.
 *
 * Top block: the public record (AIDA), row by row, with the stronger
 * side quietly marked. Bottom block: the engine's verdicts (V, quality,
 * risk, capital fingerprints) for whichever sides have been diagnosed —
 * a side that hasn't been diagnosed says so instead of faking numbers.
 */
export function CompareView({ a, b }: { a: CompareSide; b: CompareSide }) {
  const rows = buildRows(a.snapshot, b.snapshot);

  return (
    <section id="compare" aria-label="Company comparison" className="space-y-4">
      <Surface tone="raised" padding="md">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
            Side by side · public record
          </div>
          <SourceBadge source="aida" label="AIDA · Bureau van Dijk" />
        </div>

        {/* Header row */}
        <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-x-4 border-b border-line pb-3">
          <span />
          {[a, b].map((side, i) => (
            <div key={side.taxCode} className="min-w-0">
              <div className={cn('truncate text-[13.5px] font-semibold', i === 0 ? 'text-text' : 'text-purple')}>
                {side.snapshot.company_name}
              </div>
              <div className="mt-0.5 truncate font-mono text-[10px] text-text-faint">
                {[side.snapshot.province, industryFromNace(side.snapshot.nace_rev_2)?.label]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
          ))}
        </div>

        {/* Metric rows */}
        <div className="divide-y divide-line-faint">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[1.1fr_1fr_1fr] items-baseline gap-x-4 py-2.5">
              <span className="text-[12.5px] text-text-dim">{row.label}</span>
              <CompareCell value={row.a} lead={row.lead === 'a'} />
              <CompareCell value={row.b} lead={row.lead === 'b'} />
            </div>
          ))}
        </div>
      </Surface>

      {/* Engine verdicts — only for diagnosed sides */}
      <Surface tone="raised" padding="md">
        <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
          Side by side · engine verdict
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[a, b].map((side) => (
            <VerdictCard key={side.taxCode} side={side} />
          ))}
        </div>
      </Surface>
    </section>
  );
}

function VerdictCard({ side }: { side: CompareSide }) {
  const v = side.valuation;
  if (!v) {
    return (
      <div className="flex flex-col justify-between rounded-lg border border-dashed border-line bg-bg-2/40 p-4">
        <div>
          <div className="truncate text-[13px] font-semibold text-text">{side.snapshot.company_name}</div>
          <p className="mt-2 text-[12.5px] leading-6 text-text-dim">
            Not diagnosed yet — the engine has no verdict for this company.
            Run its diagnostic to unlock V, quality and the capital fingerprint.
          </p>
        </div>
        <Link
          href={`/companies/${encodeURIComponent(side.taxCode)}/diagnostic`}
          className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-gold hover:underline"
        >
          Run diagnostic <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  const capitals = [
    { key: 'fin' as const, score: v.cap_financial ?? 0 },
    { key: 'tech' as const, score: v.cap_technological ?? 0 },
    { key: 'human' as const, score: v.cap_human ?? 0 },
    { key: 'rel' as const, score: v.cap_relational ?? 0 },
  ];

  return (
    <div className="rounded-lg border border-line bg-bg-1 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-text">{side.snapshot.company_name}</div>
          <div className="mt-2 font-serif text-[26px] font-medium leading-none text-text">
            {formatEurCompact(v.v_current_eur)}
          </div>
          <div className="mt-1 font-mono text-[10.5px] text-text-faint">
            Range {formatEurCompact(v.v_low_eur, { decimals: 1 })}–{formatEurCompact(v.v_high_eur, { decimals: 1 })}
          </div>
        </div>
        <CapitalGlyph capitals={capitals} size={56} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line-faint pt-3 font-mono text-[11px]">
        <span className="text-text-dim">
          Quality <strong className="text-text">{v.quality_score ?? '—'}/100</strong>
        </span>
        <span className="text-text-dim">
          Risk <strong className="text-text">{v.risk_index ?? '—'}</strong>
        </span>
        <span className="text-text-dim">
          SQF <strong className="text-text">{v.sqf?.toFixed(2) ?? '—'}</strong>
        </span>
        <span className="text-text-dim">
          GF <strong className="text-text">{v.gf?.toFixed(2) ?? '—'}</strong>
        </span>
      </div>
    </div>
  );
}

function CompareCell({ value, lead }: { value: string; lead: boolean }) {
  return (
    <span
      className={cn(
        'font-mono text-[12.5px]',
        lead ? 'font-semibold text-text' : 'text-text-dim',
      )}
    >
      {value}
      {lead && <span className="ml-1.5 align-middle text-[9px] text-gold">●</span>}
    </span>
  );
}

// =============================================================================
// Row construction — derived strictly from the two snapshots.
// =============================================================================
interface Row {
  label: string;
  a: string;
  b: string;
  /** Which side leads on this metric, when comparable. */
  lead: 'a' | 'b' | null;
}

function buildRows(sa: AidaSnapshot, sb: AidaSnapshot): Row[] {
  const rows: Row[] = [];

  const push = (
    label: string,
    va: number | null,
    vb: number | null,
    fmt: (n: number) => string,
    higherIsBetter: boolean | null = true,
  ) => {
    const lead =
      higherIsBetter === null || va == null || vb == null || va === vb
        ? null
        : (va > vb) === higherIsBetter
          ? 'a'
          : 'b';
    rows.push({
      label,
      a: va == null ? '—' : fmt(va),
      b: vb == null ? '—' : fmt(vb),
      lead,
    });
  };

  const eur = (thk: number) => formatEurCompact(thkToEur(thk), { decimals: 1, signed: true });

  push('Revenue (last year)', sa.revenue_last_thk, sb.revenue_last_thk, eur);
  push('Revenue CAGR (2y)', cagr2y(sa), cagr2y(sb), (n) => formatPercent(n, 1));
  push('EBITDA', sa.ebitda_last_thk, sb.ebitda_last_thk, eur);
  push('EBITDA margin', sa.ebitda_margin_pct, sb.ebitda_margin_pct, (n) => formatPercent(n, 1));
  push('Employees', sa.employees, sb.employees, (n) => String(Math.round(n)), null);
  push(
    'Revenue / employee',
    sa.turnover_per_employee_eur,
    sb.turnover_per_employee_eur,
    (n) => formatEurCompact(n, { decimals: 0 }),
  );
  push('Net financial position', sa.net_financial_position_thk, sb.net_financial_position_thk, eur);
  push('Debt / EBITDA', sa.debt_ebitda_ratio, sb.debt_ebitda_ratio, (n) => `${n.toFixed(1)}×`, false);
  push('R&D / revenue', rdRatio(sa), rdRatio(sb), (n) => formatPercent(n, 1));

  return rows;
}

function cagr2y(s: AidaSnapshot): number | null {
  const last = s.revenue_last_thk ?? s.revenue_2024_thk;
  const base = s.revenue_2022_thk;
  if (last == null || base == null || base <= 0 || last <= 0) return null;
  return (Math.sqrt(last / base) - 1) * 100;
}

function rdRatio(s: AidaSnapshot): number | null {
  if (s.rd_expense_thk == null || s.revenue_last_thk == null || s.revenue_last_thk <= 0) return null;
  return (s.rd_expense_thk / s.revenue_last_thk) * 100;
}
