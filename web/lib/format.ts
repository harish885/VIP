/**
 * lib/format — the single home for number / money formatting.
 *
 * Every component imports from here instead of re-implementing the same
 * €-compaction recipe. AIDA stores monetary values in *thousands* of EUR
 * (the `_thk` suffix in the snapshot view) — use the `Thk` helpers for
 * those and the plain helpers for absolute EUR.
 */

const DASH = '—';

function isBlank(value: number | null | undefined): value is null | undefined {
  return value === null || value === undefined || Number.isNaN(value);
}

/** Full-precision currency with thousand separators. €1,234,567 */
export function formatCurrency(value: number | null | undefined): string {
  if (isBlank(value)) return DASH;
  return `€${Math.round(value).toLocaleString('en-US')}`;
}

/**
 * Compact currency: €4.21M / €840K / €312.
 *
 * - `decimals` controls the M-range precision (K is always whole).
 * - `signed` renders negatives as −€1.20M instead of €-1.2M.
 * - Zero / null / NaN render as an em-dash, matching every read-only
 *   surface in the cockpit. Pass `zero: '€0'` where a literal zero is
 *   meaningful.
 */
export function formatEurCompact(
  value: number | null | undefined,
  opts: { decimals?: number; signed?: boolean; zero?: string } = {},
): string {
  const { decimals = 2, signed = false, zero = DASH } = opts;
  if (isBlank(value)) return DASH;
  if (value === 0) return zero;
  const sign = signed && value < 0 ? '−' : '';
  const abs = Math.abs(value);
  const body =
    abs >= 1_000_000
      ? `€${(abs / 1_000_000).toFixed(decimals)}M`
      : abs >= 1_000
        ? `€${(abs / 1_000).toFixed(0)}K`
        : `€${Math.round(abs)}`;
  return `${sign}${body}`;
}

/** Millions as a bare number — "4.2" — for surfaces that label the unit themselves. */
export function formatEurMillions(eur: number, decimals = 1): string {
  return (eur / 1_000_000).toFixed(decimals);
}

/** Thousand-EUR (AIDA `_thk`) value rendered as €X.XM. */
export function formatThkMillions(thk: number, decimals = 1): string {
  return `€${(thk / 1_000).toFixed(decimals)}M`;
}

/** Thousand-EUR value as a whole-number string with separators (no symbol). */
export function formatThk(thk: number): string {
  return Math.round(thk).toLocaleString('en-US');
}

/** Convert a thousand-EUR snapshot value to absolute EUR (null-safe). */
export function thkToEur(thk: number | null | undefined): number {
  return thk == null ? 0 : Math.round(thk * 1_000);
}

/** Percent with optional decimals. 12% / 12.5% */
export function formatPercent(value: number | null | undefined, decimals = 0): string {
  if (isBlank(value)) return DASH;
  return `${value.toFixed(decimals)}%`;
}

/** Round to one decimal place. */
export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Parse a user-typed string into a clean number. Strips €, commas, spaces,
 * %. Returns NaN on empty/garbage so RHF + Zod can surface validation.
 */
export function parseNumberInput(raw: string): number {
  if (!raw) return NaN;
  const cleaned = raw.replace(/[€%,\s]/g, '').replace(/,/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

/** Display value for a number input — applies thousand separators. */
export function displayNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  return value.toLocaleString('en-US');
}
