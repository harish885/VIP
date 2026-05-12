/**
 * Number formatting helpers used by the diagnostic form and dashboard.
 */

/** Format a number as € with thousand separators. €1,234,567 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `€${value.toLocaleString('en-US')}`;
}

/** Compact currency: €1.2M, €840K, €15.6M */
export function formatCurrencyCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (Math.abs(value) >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `€${(value / 1_000).toFixed(0)}K`;
  return `€${value}`;
}

/** Percent with optional decimals. 12% / 12.5% */
export function formatPercent(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value.toFixed(decimals)}%`;
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
