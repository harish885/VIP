'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight, Building2, History, Search, Command as CmdIcon, X } from 'lucide-react';
import { cn } from '@/lib/cn';

const RECENT_KEY = 'vip:recent-companies';
const RECENT_MAX = 8;

interface RecentEntry {
  tax_code: string;
  name: string;
  visited_at: string;
}

interface Suggestion {
  tax_code: string;
  company_name: string;
  province: string | null;
  nace_rev_2: string | null;
  revenue_last_thk: number | null;
}

/**
 * CommandPalette — Cmd-K (Ctrl-K on Windows / Linux) overlay.
 *
 * Mounted globally on the (app) layout so every screen inside the
 * authenticated workspace can open it. Offers:
 *
 *   · live search against /api/companies/search (debounced 200ms)
 *   · recent-companies list (localStorage; last 8, freshest first)
 *   · keyboard: ↑ ↓ to move, Enter to open, Esc to close
 *
 * Tracks the current company on each per-company page so the recent
 * list reflects actual usage.
 */
export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Hot-key listener — Cmd/Ctrl + K opens; Esc closes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Hydrate recent list on mount + when palette opens.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as RecentEntry[]);
    } catch {
      // ignore corrupt blob
    }
  }, [open]);

  // Track the currently-viewed company so the recent list is real.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const match = pathname?.match(/^\/companies\/([^/?]+)/);
    const tax = match?.[1] ? decodeURIComponent(match[1]) : null;
    if (!tax) return;
    // Read the displayed company name from the document title when present.
    const title = document.title.split(' · ')[0]?.trim() || tax;
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      const list: RecentEntry[] = raw ? JSON.parse(raw) : [];
      const next: RecentEntry[] = [
        { tax_code: tax, name: title, visited_at: new Date().toISOString() },
        ...list.filter((r) => r.tax_code !== tax),
      ].slice(0, RECENT_MAX);
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // quota or parse error — best effort
    }
  }, [pathname]);

  // Focus input when palette opens.
  useEffect(() => {
    if (open) {
      setActive(0);
      setQ('');
      setResults([]);
      // micro-delay so the input is mounted before focus
      const id = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Search debounced.
  useEffect(() => {
    if (!open) return;
    abortRef.current?.abort();
    if (q.trim().length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/companies/search?q=${encodeURIComponent(q.trim())}&limit=8`,
          { signal: ctrl.signal, cache: 'no-store' },
        );
        const json = await res.json();
        if (json.ok) setResults(json.results as Suggestion[]);
      } catch {
        // aborted — ignore
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [q, open]);

  const items = useMemo(() => {
    if (q.trim().length > 0) {
      return results.map((r) => ({
        kind: 'result' as const,
        tax_code: r.tax_code,
        name: r.company_name,
        sub: [r.province, r.nace_rev_2 ? `NACE ${r.nace_rev_2}` : null].filter(Boolean).join(' · '),
      }));
    }
    return recent.map((r) => ({
      kind: 'recent' as const,
      tax_code: r.tax_code,
      name: r.name,
      sub: `Visited ${r.visited_at ? new Date(r.visited_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}`,
    }));
  }, [q, results, recent]);

  function pick(taxCode: string) {
    setOpen(false);
    router.push(`/companies/${encodeURIComponent(taxCode)}`);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open command palette (Cmd-K)"
        className="fixed bottom-5 right-5 z-40 hidden items-center gap-2 rounded-full border border-line bg-bg-1/95 px-3 py-1.5 font-mono text-[11px] text-text-dim shadow-[0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-glass transition-colors hover:border-line-2 hover:text-text sm:inline-flex"
      >
        <CmdIcon size={12} /> K
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close command palette"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-xl border border-line bg-bg-1 shadow-[0_24px_64px_rgba(0,0,0,0.18)]"
      >
        <div className="flex items-center gap-2 border-b border-line px-3.5 py-3">
          <Search size={14} className="text-text-faint" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, items.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const next = items[active];
                if (next) pick(next.tax_code);
              }
            }}
            placeholder={q ? 'Search company, tax code, NACE or province…' : 'Search or jump to a recent company…'}
            className="flex-1 bg-transparent font-mono text-[13px] text-text placeholder:text-text-faint focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="text-text-faint hover:text-text"
          >
            <X size={14} />
          </button>
        </div>

        <ul role="listbox" className="max-h-[60vh] overflow-y-auto">
          {loading && items.length === 0 && (
            <li className="px-4 py-3 font-mono text-[11.5px] text-text-faint">Searching…</li>
          )}
          {!loading && items.length === 0 && (
            <li className="px-4 py-4 font-mono text-[11.5px] text-text-faint">
              {q.trim().length === 0
                ? 'No recent companies yet. Type to search the AIDA set.'
                : <>No companies match <span className="text-amber">{q}</span>.</>}
            </li>
          )}
          {items.map((item, i) => (
            <li key={`${item.kind}-${item.tax_code}`}>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(item.tax_code)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  i === active ? 'bg-cyan/[0.08]' : 'hover:bg-bg-2/60',
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-bg-2 text-text-dim">
                  {item.kind === 'recent' ? <History size={12} /> : <Building2 size={12} />}
                </span>
                <span className="min-w-0 flex-1">
                  <div className="truncate font-mono text-[12.5px] font-semibold text-text">
                    {item.name}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[10.5px] text-text-faint">
                    {item.sub} · Tax {item.tax_code}
                  </div>
                </span>
                <ArrowRight size={12} className="shrink-0 text-text-faint" />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-line bg-bg-2/40 px-4 py-2 font-mono text-[10px] text-text-faint">
          <span>↑↓ navigate · Enter open · Esc close</span>
          <span>⌘K toggle</span>
        </div>
      </div>
    </div>
  );
}
