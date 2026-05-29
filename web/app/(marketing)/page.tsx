import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CircleDollarSign,
  Database,
  GitBranch,
  LineChart,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { SearchBar } from '@/components/companies/search-bar';
import { StatusBadge } from '@/components/vip-ui/status-badge';
import { SourceBadge } from '@/components/vip-ui/source-badge';

const KPI = [
  { label: 'Enterprise value', value: '€4.52M', sub: 'Range €4.1M-€5.1M', tone: 'text-text' },
  { label: 'Value gap', value: '+38%', sub: 'Potential €6.2M', tone: 'text-green' },
  { label: 'Quality', value: '63/100', sub: 'Mid-cohort structure', tone: 'text-text' },
  { label: 'Risk', value: 'MEDIUM', sub: 'Client concentration', tone: 'text-amber' },
] as const;

const LOOP = [
  {
    icon: Database,
    title: 'Start with AIDA',
    body: 'Revenue, EBITDA, sector, headcount and public peer context are pulled before the interview starts.',
  },
  {
    icon: Building2,
    title: 'Add founder truth',
    body: 'The diagnostic captures transferability, systems, client quality, scalability and the signals filings miss.',
  },
  {
    icon: GitBranch,
    title: 'Build the bridge',
    body: 'EBITDA, sector multiple, SQF and GF stay visible as separate drivers of enterprise value.',
  },
  {
    icon: Target,
    title: 'Rank the moves',
    body: 'The output ends with the Top-3 actions most likely to close the value gap.',
  },
] as const;

const ACTIONS = [
  ['01', 'Reduce client concentration', '+10.8% V', 'Relational'],
  ['02', 'Introduce recurring revenue', '+13.9% V', 'Growth'],
  ['03', 'Strengthen middle management', '+7.2% V', 'Human'],
] as const;

export default function MarketingHome() {
  return (
    <div className="relative mx-auto min-h-screen max-w-[1180px] px-4 pb-16 pt-28 sm:px-6 lg:pt-32">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:items-start">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-md border border-line bg-bg-1/85 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">
            <Database size={11} />
            AIDA company-first valuation
          </div>

          <h1 className="mt-5 max-w-[720px] font-serif text-[42px] font-medium leading-[0.98] tracking-tight text-text sm:text-[58px] lg:text-[72px]">
            Value intelligence for one company at a time.
          </h1>

          <p className="mt-5 max-w-[620px] text-[15px] leading-7 text-text-dim sm:text-[16px]">
            Search an Italian SME, keep or override the public financials, answer the
            strategic diagnostic, and see the valuation bridge, risk signal and next moves.
          </p>

          <div className="mt-7 max-w-[720px]">
            <SearchBar />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-text-faint">
            <StatusBadge tone="neutral">14,999 SMEs</StatusBadge>
            <StatusBadge tone="neutral">17 scores + 2 context</StatusBadge>
            <StatusBadge tone="neutral">AIDA plus overrides</StatusBadge>
          </div>
        </div>

        <CockpitPreview />
      </section>

      <section className="mt-12 grid gap-3 md:grid-cols-4">
        {LOOP.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-lg border border-line bg-bg-1 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-bg-2 text-cyan">
                <Icon size={15} />
              </div>
              <h2 className="mt-4 text-[15px] font-semibold text-text">{item.title}</h2>
              <p className="mt-2 text-[12.5px] leading-6 text-text-dim">{item.body}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 grid gap-4 rounded-lg border border-line bg-bg-1 p-5 sm:p-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-faint">
            Method, not theatre
          </div>
          <h2 className="mt-2 font-serif text-[26px] font-medium leading-tight text-text">
            The model shows where the number comes from.
          </h2>
          <p className="mt-3 max-w-[540px] text-[13.5px] leading-7 text-text-dim">
            VIP keeps the sources visible: public AIDA data, entrepreneur overrides,
            computed factors and qualitative proxies. That provenance should be obvious
            before anyone trusts the value.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <SourceBadge source="aida" label="AIDA" />
            <SourceBadge source="override" label="Your numbers" />
            <SourceBadge source="computed" label="Computed" />
            <SourceBadge source="proxy" label="Proxy" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricBlock icon={<CircleDollarSign size={15} />} label="Formula" value="EBITDA x M x SQF x GF" />
          <MetricBlock icon={<BarChart3 size={15} />} label="Capital scores" value="Financial, tech, human, relational" />
          <MetricBlock icon={<LineChart size={15} />} label="Scenario lab" value="Live value recompute" />
          <MetricBlock icon={<ShieldAlert size={15} />} label="Risk signal" value="Flags, not vague warnings" />
        </div>
      </section>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-[11px] uppercase tracking-[0.18em] text-text-faint">
        <span>VIP · Value Intelligence Platform</span>
        <Link href="/method" className="inline-flex items-center gap-1.5 hover:text-text-dim">
          Method detail <ArrowRight size={11} />
        </Link>
      </footer>
    </div>
  );
}

function CockpitPreview() {
  return (
    <aside className="rounded-lg border border-line bg-bg-1 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">
            Decision cockpit
          </div>
          <h2 className="mt-1 font-serif text-[24px] font-medium leading-tight text-text">
            ACME Industrie S.R.L.
          </h2>
          <p className="mt-1 text-[12px] text-text-faint">NACE 282 · Manufacturing · Lombardia</p>
        </div>
        <StatusBadge tone="info">Demo run</StatusBadge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {KPI.map((item) => (
          <div key={item.label} className="rounded-md border border-line bg-bg-2/55 px-3 py-3">
            <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-text-faint">
              {item.label}
            </div>
            <div className={`mt-1 font-serif text-[24px] font-medium leading-none ${item.tone}`}>
              {item.value}
            </div>
            <div className="mt-1 truncate text-[11px] text-text-faint">{item.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-md border border-line bg-bg-1 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-faint">
            Value bridge
          </span>
          <SourceBadge source="computed" />
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center font-mono text-[11px] text-text-dim">
          <BridgeCell label="EBITDA" value="€750K" />
          <span>x</span>
          <BridgeCell label="M sector" value="5.0x" />
          <span>x</span>
          <BridgeCell label="SQF / GF" value="1.20x" />
        </div>
      </div>

      <div className="mt-4 rounded-md border border-line bg-bg-1 p-3">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-faint">
          Top actions
        </div>
        <ol className="mt-2 divide-y divide-line-faint">
          {ACTIONS.map(([rank, title, uplift, capital]) => (
            <li key={rank} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 py-2">
              <span className="font-mono text-[11px] font-bold text-cyan">{rank}</span>
              <span className="min-w-0 truncate text-[13px] font-medium text-text">{title}</span>
              <span className="rounded-md bg-green/[0.08] px-2 py-0.5 font-mono text-[10px] font-bold text-green">
                {uplift}
              </span>
              <span className="col-start-2 text-[11px] text-text-faint">{capital}</span>
            </li>
          ))}
        </ol>
      </div>

      <Link
        href="/companies"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-text bg-text px-4 py-2.5 text-[13px] font-semibold text-bg-1 transition-colors hover:bg-text-dim"
      >
        Open company search <ArrowRight size={14} />
      </Link>
    </aside>
  );
}

function BridgeCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-bg-2/55 px-2 py-2">
      <div className="text-[9px] uppercase tracking-[0.16em] text-text-faint">{label}</div>
      <div className="mt-1 font-semibold text-text">{value}</div>
    </div>
  );
}

function MetricBlock({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-bg-2/45 p-4">
      <div className="flex items-center gap-2 text-cyan">
        {icon}
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <div className="mt-2 text-[13px] font-medium text-text">{value}</div>
    </div>
  );
}
