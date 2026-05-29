import Link from 'next/link';
import { Database, Search } from 'lucide-react';
import { SearchBar } from '@/components/companies/search-bar';
import { StatusBadge } from '@/components/vip-ui/status-badge';

export const metadata = { title: 'Companies · VIP' };
export const dynamic = 'force-dynamic';

/**
 * /companies — search workspace.
 *
 * The search box behaves like a focused autocomplete: type a name, tax
 * code, NACE prefix or province, then open the company to score it.
 * No second results list is server-rendered here; the dropdown is the
 * canonical surface so the page stays uncluttered.
 */
export default async function CompaniesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = (searchParams?.q ?? '').trim();
  return (
    <div className="mx-auto max-w-[1080px] px-4 pb-16 pt-8 sm:px-6">
      <header className="max-w-[680px]">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-cyan">
          <Database size={11} /> AIDA · 14,999 Italian SMEs
        </div>
        <h1 className="mt-2 font-serif text-[30px] font-medium leading-[1.07] tracking-tight text-text sm:text-[34px]">
          Pick a company to value.
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-text-dim">
          One typed term covers four fields — company name, tax code,
          NACE-rev-2, or province. Use ↑ / ↓ to navigate the suggestions,
          Enter to open.
        </p>
      </header>

      <div className="mt-6">
        <SearchBar initialQuery={q} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-[11.5px] text-text-faint">
        <span className="font-mono uppercase tracking-eyebrow">Try</span>
        {EXAMPLES.map((e) => (
          <Link
            key={e}
            href={`/companies?q=${encodeURIComponent(e)}`}
            className="rounded-full border border-line bg-bg-1 px-2.5 py-0.5 font-mono text-[11px] text-text-dim transition-colors hover:border-line-2 hover:text-text"
          >
            {e}
          </Link>
        ))}
        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-text-faint">
          <Search size={10} /> Hit / on the keyboard to focus
        </span>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-2 text-[11px] text-text-faint">
        <StatusBadge tone="neutral">Source · AIDA / Bureau van Dijk</StatusBadge>
        <span>Last available year · frozen at submission time</span>
      </div>
    </div>
  );
}

const EXAMPLES = ['Huni', '3101', 'Bergamo', 'Milano'];
