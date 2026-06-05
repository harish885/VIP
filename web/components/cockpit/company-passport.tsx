'use client';

import type { ReactNode } from 'react';
import { MapPin, Factory, Users, BarChart3, Coins, FlaskConical, Wallet } from 'lucide-react';
import type { AidaSnapshot } from '@/lib/aida';
import { Surface } from '@/components/vip-ui/surface';
import { StatusBadge } from '@/components/vip-ui/status-badge';
import { SourceBadge } from '@/components/vip-ui/source-badge';
import { cn } from '@/lib/cn';
import { formatEurCompact, thkToEur } from '@/lib/format';

interface Props {
  snapshot: AidaSnapshot;
  taxCode: string;
  status: 'not_diagnosed' | 'diagnosed' | 'recent';
  /** Optional eyebrow line (e.g. "Latest run · 2h ago"). */
  meta?: ReactNode;
  /** Optional CTA cluster (re-run / reset / open diagnostic). */
  actions?: ReactNode;
  /** Optional identity mark (the capital fingerprint, once diagnosed). */
  glyph?: ReactNode;
  /** When true the panel renders the full identity strip; on the
   *  dashboard hero we usually hide it because the workspace owns the
   *  identity. */
  variant?: 'full' | 'compact';
}

/**
 * CompanyPassport — the AIDA factsheet rendered as the founder's
 * "passport" for the workspace. Always visible, always grounded in
 * what the public record says about the company. Every figure is
 * tagged with a SourceBadge so the reader can audit provenance at
 * a glance.
 */
export function CompanyPassport({
  snapshot,
  taxCode,
  status,
  meta,
  actions,
  glyph,
  variant = 'full',
}: Props) {
  const aidaRdRatio =
    snapshot.rd_expense_thk != null && snapshot.revenue_last_thk != null && snapshot.revenue_last_thk > 0
      ? (snapshot.rd_expense_thk / snapshot.revenue_last_thk) * 100
      : null;
  return (
    <Surface tone="raised" padding="lg" className="overflow-hidden">
      {variant === 'full' && (
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <PassportStatus status={status} />
              {meta}
            </div>
            <div className="mt-3 flex items-center gap-3.5">
              {glyph}
              <h1 className="min-w-0 font-serif text-[28px] font-medium leading-[1.05] tracking-tight text-text sm:text-[34px]">
                {snapshot.company_name}
              </h1>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-text-dim">
              {snapshot.province && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={12} /> {snapshot.province}
                </span>
              )}
              {snapshot.nace_rev_2 && (
                <>
                  <Dot />
                  <span className="inline-flex items-center gap-1.5">
                    <Factory size={12} /> NACE {snapshot.nace_rev_2}
                  </span>
                </>
              )}
              {snapshot.size_estimate && (
                <>
                  <Dot />
                  <span>{snapshot.size_estimate}</span>
                </>
              )}
              <Dot />
              <span className="font-mono text-[11px] text-text-faint">Tax · {taxCode}</span>
            </div>
            {(snapshot.nace_rev_2_description || snapshot.primary_business_line) && (
              <p className="mt-2 max-w-[64ch] text-[12.5px] leading-snug text-text-dim">
                {snapshot.nace_rev_2_description ?? snapshot.primary_business_line}
                {snapshot.peer_group_name && (
                  <span className="text-text-faint"> · peer group {snapshot.peer_group_name}</span>
                )}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-start gap-2">{actions}</div>}
        </div>
      )}

      <div
        className={cn(
          variant === 'full' ? 'mt-7 border-t border-line-faint pt-6' : '',
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-faint">
            Public factsheet
          </div>
          <SourceBadge source="aida" label="AIDA · Bureau van Dijk" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <PassportFact
            icon={<BarChart3 size={14} />}
            label="Revenue"
            value={fmtEur(thkToEur(snapshot.revenue_last_thk))}
            sub="Last reported year"
          />
          <PassportFact
            icon={<Coins size={14} />}
            label="EBITDA"
            value={fmtEur(thkToEur(snapshot.ebitda_last_thk))}
            sub={
              snapshot.ebitda_margin_pct != null
                ? `Margin ${snapshot.ebitda_margin_pct.toFixed(1)}%`
                : '—'
            }
          />
          <PassportFact
            icon={<Users size={14} />}
            label="Employees"
            value={snapshot.employees != null ? Math.round(snapshot.employees).toString() : '—'}
            sub={
              snapshot.turnover_per_employee_eur != null
                ? `€${Math.round(snapshot.turnover_per_employee_eur).toLocaleString()} / head`
                : '—'
            }
          />
          <PassportFact
            icon={<Wallet size={14} />}
            label="Net fin. position"
            value={fmtEur(thkToEur(snapshot.net_financial_position_thk))}
            sub={
              snapshot.debt_ebitda_ratio != null
                ? `Debt / EBITDA ${snapshot.debt_ebitda_ratio.toFixed(1)}×`
                : '—'
            }
          />
          <PassportFact
            icon={<FlaskConical size={14} />}
            label="R&D ratio"
            value={
              aidaRdRatio == null || aidaRdRatio === 0
                ? '—'
                : `${aidaRdRatio.toFixed(1)}%`
            }
            sub={
              snapshot.rd_expense_thk != null && snapshot.rd_expense_thk > 0
                ? `${fmtEur(thkToEur(snapshot.rd_expense_thk))} reported`
                : 'Not reported'
            }
          />
        </div>
      </div>
    </Surface>
  );
}

function PassportStatus({ status }: { status: Props['status'] }) {
  if (status === 'not_diagnosed') {
    return <StatusBadge tone="neutral">Not diagnosed</StatusBadge>;
  }
  if (status === 'recent') {
    return <StatusBadge tone="positive">Updated recently</StatusBadge>;
  }
  return <StatusBadge tone="info">Diagnosed</StatusBadge>;
}

function PassportFact({
  icon,
  label,
  value,
  sub,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-line bg-bg-1/80 px-4 py-3">
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
        <span className="text-text-faint">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-2 font-serif text-[20px] font-medium leading-tight tracking-tight text-text">
        {value}
      </div>
      <div className="mt-1 truncate text-[11.5px] text-text-faint">{sub}</div>
    </div>
  );
}

function Dot() {
  return <span className="text-text-faint">·</span>;
}

/** Signed compact € — net financial position can legitimately be negative. */
function fmtEur(eur: number): string {
  return formatEurCompact(eur, { signed: true });
}
