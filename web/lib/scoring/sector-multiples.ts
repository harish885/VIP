/**
 * Phase 06 — sector EBITDA multiples.
 *
 * Base multiples are taken from European mid-market deal databases (Argos
 * Mid-Market Index, EY Capital Briefing, Mergermarket Q1 2026), then
 * illiquidity-discounted at 25% for unlisted SMEs.
 *
 * Lookup precedence:
 *   1. exact 3-digit NACE code (e.g. "282")
 *   2. 2-digit NACE prefix    (e.g. "28")
 *   3. high-level sector label from the diagnostic form (Manufacturing,
 *      Tech / Software, …)
 *   4. catch-all DEFAULT
 *
 * `applyIlliquidityDiscount` exposes the discount so callers can show the
 * pre/post number in the UI later if they want to.
 */

const ILLIQUIDITY_DISCOUNT = 0.75;   // 25% off listed-market comparables

/** Public-market mid-market base multiples (before illiquidity discount). */
const BASE_MULTIPLES_BY_NACE_PREFIX: Record<string, number> = {
  '10': 6.4,  // Food
  '13': 5.6,  // Textiles
  '20': 7.0,  // Chemicals
  '21': 9.2,  // Pharma
  '22': 5.8,  // Rubber & plastics
  '24': 5.4,  // Basic metals
  '25': 6.0,  // Fabricated metal
  '26': 7.6,  // Computer/electronic
  '27': 6.8,  // Electrical equipment
  '28': 6.7,  // Machinery & equipment  (our AIDA calibration set)
  '29': 6.0,  // Motor vehicles
  '46': 5.4,  // Wholesale
  '47': 5.2,  // Retail
  '49': 5.6,  // Land transport / logistics
  '58': 8.0,  // Publishing / software
  '62': 9.4,  // Computer programming
  '63': 8.2,  // Information services
  '71': 7.0,  // Architecture / engineering
  '72': 8.6,  // R&D
};

const BASE_MULTIPLES_BY_SECTOR: Record<string, number> = {
  'Manufacturing':              6.7,
  'Wholesale & Distribution':   5.4,
  'Professional Services':      6.0,
  'Tech / Software':            9.2,
  'Retail / e-Commerce':        5.6,
  'Construction':               4.8,
  'Logistics':                  5.6,
  'Other':                      5.8,
};

const DEFAULT_BASE_MULTIPLE = 5.8;

export interface SectorMultipleLookup {
  naceCode?: string | null;
  sector?: string | null;
}

export function lookupBaseMultiple({ naceCode, sector }: SectorMultipleLookup): number {
  if (naceCode) {
    const exact = BASE_MULTIPLES_BY_NACE_PREFIX[naceCode];
    if (exact !== undefined) return exact;
    const prefix2 = naceCode.slice(0, 2);
    const byPrefix = BASE_MULTIPLES_BY_NACE_PREFIX[prefix2];
    if (byPrefix !== undefined) return byPrefix;
  }
  if (sector) {
    const bySector = BASE_MULTIPLES_BY_SECTOR[sector];
    if (bySector !== undefined) return bySector;
  }
  return DEFAULT_BASE_MULTIPLE;
}

export function applyIlliquidityDiscount(baseMultiple: number): number {
  return round(baseMultiple * ILLIQUIDITY_DISCOUNT, 2);
}

export function getSectorMultiple(lookup: SectorMultipleLookup): number {
  return applyIlliquidityDiscount(lookupBaseMultiple(lookup));
}

function round(n: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}
