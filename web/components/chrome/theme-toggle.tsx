'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/cn';

const STORAGE_KEY = 'vip-theme';
type Theme = 'light' | 'dark';

function appliedTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/**
 * ThemeToggle — light/dark switch.
 *
 * The actual theme is applied pre-paint by the inline script in
 * app/layout.tsx (system preference unless the user chose one here).
 * This control just flips `data-theme` on <html> and persists the
 * choice. Renders a fixed-size placeholder until mounted so the icon
 * never mismatches between server and client.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(appliedTheme());
  }, []);

  function toggle() {
    const next: Theme = appliedTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — theme just won't persist */
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-bg-1 text-text-dim',
        'transition-colors hover:border-line-2 hover:text-text',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40',
        className,
      )}
    >
      {theme === null ? (
        <span className="block h-[13px] w-[13px]" aria-hidden />
      ) : theme === 'dark' ? (
        <Sun size={13} />
      ) : (
        <Moon size={13} />
      )}
    </button>
  );
}
