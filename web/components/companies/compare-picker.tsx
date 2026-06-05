'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitCompareArrows, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { industryFromNace } from '@/lib/industry';

interface Suggestion {
  tax_code: string;
  company_name: string;
  province: string | null;
  nace_rev_2: string | null;
}

/**
 * ComparePicker — chooses the comparator company.
 *
 * A compact typeahead over the same /api/companies/search endpoint as
 * the main search bar. Picking a company sets `?vs=<taxCode>` on the
 * current company URL — the server renders the comparison; the URL is
 * shareable and survives reload.
 */
export function ComparePicker({
  taxCode,
  vsName,
}: {
  /** The company currently open. */
  taxCode: string;
  /** Name of the active comparator, when one is set. */
  vsName?: string | null;
}) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/companies/search?q=${encodeURIComponent(q.trim())}&limit=6`,
          { cache: 'no-store' },
        );
        const json = await res.json();
        setItems(
          json.ok
            ? (json.results as Suggestion[]).filter((s) => s.tax_code !== taxCode)
            : [],
        );
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, taxCode]);

  function pick(s: Suggestion) {
    setOpen(false);
    setQ('');
    router.push(`/companies/${encodeURIComponent(taxCode)}?vs=${encodeURIComponent(s.tax_code)}#compare`, {
      scroll: false,
    });
  }

  function clear() {
    router.push(`/companies/${encodeURIComponent(taxCode)}`, { scroll: false });
  }

  if (vsName) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md border border-purple/40 bg-purple/[0.07] px-3 py-1.5 font-mono text-[11.5px] text-purple">
        <GitCompareArrows size={12} />
        <span className="max-w-[260px] truncate">vs {vsName}</span>
        <button
          type="button"
          onClick={clear}
          aria-label="Stop comparing"
          className="rounded-sm text-purple/70 transition-colors hover:text-purple"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[360px]">
      <div className="relative">
        <GitCompareArrows
          size={13}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-faint"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => q && setOpen(true)}
          placeholder="Compare with another company…"
          aria-label="Compare with another company"
          className="h-9 w-full rounded-md border border-line bg-bg-1 pl-9 pr-8 font-mono text-[12px] text-text placeholder:text-text-faint focus:border-purple/40 focus:outline-none focus:ring-1 focus:ring-purple/30"
        />
        {loading && (
          <Loader2
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-purple"
          />
        )}
      </div>

      {open && items.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-md border border-line bg-bg-1/95 shadow-2xl backdrop-blur-glass">
          {items.map((s) => (
            <li key={s.tax_code}>
              <button
                type="button"
                onClick={() => pick(s)}
                className={cn(
                  'flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-purple/[0.08]',
                )}
              >
                <span className="truncate font-mono text-[12px] font-semibold text-text">
                  {s.company_name}
                </span>
                <span className="truncate font-mono text-[10px] text-text-faint">
                  {[s.province, industryFromNace(s.nace_rev_2)?.label].filter(Boolean).join(' · ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
