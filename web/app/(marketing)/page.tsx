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
import { LiveCockpitPreview } from '@/components/marketing/live-cockpit-preview';
import { StatusBadge } from '@/components/vip-ui/status-badge';
import { SourceBadge } from '@/components/vip-ui/source-badge';

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

        <LiveCockpitPreview />
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
        <span className="flex items-center gap-5">
          <Link href="/pricing" className="inline-flex items-center gap-1.5 hover:text-text-dim">
            Pricing <ArrowRight size={11} />
          </Link>
          <Link href="/method" className="inline-flex items-center gap-1.5 hover:text-text-dim">
            Method detail <ArrowRight size={11} />
          </Link>
        </span>
      </footer>
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
