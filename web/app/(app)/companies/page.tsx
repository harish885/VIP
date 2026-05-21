import { SearchBar } from '@/components/companies/search-bar';

export const metadata = { title: 'Companies · VIP' };
export const dynamic = 'force-dynamic';

/**
 * /companies — search workspace.
 *
 * The search box behaves like a focused autocomplete: type one or more
 * characters, see company-name suggestions, then open the selected company.
 * We intentionally avoid server-rendering a second results list underneath
 * the dropdown because it creates a duplicated, crowded search experience.
 */
export default async function CompaniesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = (searchParams?.q ?? '').trim();

  return (
    <div className="mx-auto max-w-[1080px] px-4 pb-16 pt-8 sm:px-6">
      <header className="max-w-[640px]">
        <h1 className="font-serif text-[31px] font-medium leading-[1.07] text-text sm:text-[34px]">
          Pick a company to value.
        </h1>
        <p className="mt-2 text-[14px] text-text-dim">
          Search the AIDA calibration set — 14&nbsp;999 Italian SMEs. Open one
          to see its strategic picture, or run the diagnostic to score it.
        </p>
      </header>

      <div className="mt-6">
        <SearchBar initialQuery={q} />
      </div>

      <p className="mt-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.22em] text-text-faint sm:tracking-eyebrow">
        Source · AIDA / Bureau van Dijk · Italian SMEs · last available year
      </p>
    </div>
  );
}
