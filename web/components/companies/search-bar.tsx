'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, MapPin, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Suggestion {
  tax_code: string;
  company_name: string;
  province: string | null;
  nace_rev_2: string | null;
  revenue_last_thk: number | null;
  employees: number | null;
}

export interface SearchBarProps {
  initialQuery?: string;
  /** Optional: tells the input "no search results to show below me" so
   *  it can take over the empty-state. */
  noServerResults?: boolean;
}

/**
 * Typeahead search for /companies.
 *
 * Fetches /api/companies/search on each keystroke, debounced 180 ms.
 * Renders a floating panel below the input with up to 10 matches.
 * Keyboard: ↑/↓ to navigate, Enter to open, Esc to close.
 * No-JS fallback: the wrapping <form action="/companies"> still submits
 * a plain GET, preserving the original server-rendered results page.
 */
export function SearchBar({ initialQuery = '' }: SearchBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click-outside closes the dropdown.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Fetch suggestions whenever the query changes (debounced).
  // Empty query → fetch top results (sorted by latest revenue) so the
  // dropdown still has something useful on focus, matching the inline copy.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`/api/companies/search?q=${encodeURIComponent(q.trim())}&limit=10`, {
          signal: ctrl.signal,
          cache: 'no-store',
        });
        const json = await res.json();
        if (!json.ok) {
          setItems([]);
          setError(json.message ?? 'Search failed.');
        } else {
          setItems(json.results as Suggestion[]);
          setError(null);
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError((e as Error).message);
        }
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  function pick(s: Suggestion) {
    setOpen(false);
    router.push(`/companies/${encodeURIComponent(s.tax_code)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) setOpen(true);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0 && items[activeIndex]) {
      e.preventDefault();
      pick(items[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      {/* GET form for no-JS fallback */}
      <form action="/companies" method="GET" autoComplete="off">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-faint"
          />
          <input
            type="search"
            name="q"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            autoFocus
            placeholder="Search by company name…"
            className="w-full rounded-xl border border-line bg-bg-2/40 py-3.5 pl-11 pr-12 font-mono text-[13px] text-text placeholder:text-text-faint focus:border-cyan/40 focus:outline-none focus:ring-1 focus:ring-cyan/30"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="search-suggestions"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-faint">
            {loading ? (
              <Loader2 size={14} className="animate-spin text-cyan" />
            ) : q.length > 0 ? (
              <button
                type="button"
                className="pointer-events-auto text-text-faint hover:text-text-dim"
                onClick={(e) => {
                  e.preventDefault();
                  setQ('');
                  setItems([]);
                  setOpen(false);
                }}
                aria-label="Clear"
              >
                <X size={14} />
              </button>
            ) : null}
          </span>
        </div>
      </form>

      {/* Suggestions dropdown — show on focus even when empty (top results) */}
      {open && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[480px] overflow-y-auto rounded-xl border border-line bg-bg-1/95 shadow-2xl backdrop-blur-glass"
        >
          {error && (
            <div className="px-4 py-3 font-mono text-[11.5px] text-amber">{error}</div>
          )}
          {!error && items.length === 0 && !loading && (
            <div className="px-4 py-4 font-mono text-[11.5px] text-text-faint">
              {q.trim().length === 0
                ? 'Start typing to search.'
                : <>No companies match <span className="text-amber">{q}</span>.</>}
            </div>
          )}
          {!error && items.length > 0 && (
            <ul className="divide-y divide-line-faint">
              {items.map((s, i) => (
                <li key={s.tax_code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => pick(s)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                      i === activeIndex ? 'bg-cyan/[0.10]' : 'hover:bg-white/[0.04]',
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-cyan/25 to-blue/25 text-cyan">
                      <Building2 size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <div className="truncate font-mono text-[12.5px] font-semibold text-text">
                        {highlight(s.company_name, q)}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-text-faint">
                        {s.province && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={9} /> {s.province}
                          </span>
                        )}
                        {s.nace_rev_2 && <span>· NACE {s.nace_rev_2}</span>}
                        {s.employees !== null && (
                          <span>· {Math.round(s.employees)} emp.</span>
                        )}
                      </div>
                    </span>
                    {s.revenue_last_thk !== null && (
                      <span className="shrink-0 font-mono text-[11px] font-semibold text-text-dim">
                        €{(s.revenue_last_thk / 1000).toFixed(1)}M
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-line-faint px-4 py-2 font-mono text-[9.5px] uppercase tracking-eyebrow text-text-faint">
            ↑ ↓ navigate · Enter to open · Esc to close
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================
function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-cyan">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}
