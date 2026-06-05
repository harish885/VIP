/**
 * lib/industry — NACE Rev. 2 division → human-readable industry.
 *
 * The AIDA calibration set is all manufacturing (divisions 10–33), but
 * "Manufacturing" tells a founder nothing. The 2-digit NACE division is
 * the honest level of detail the public record supports: plastics is 22,
 * machinery is 28, food is 10. Labels follow the official NACE Rev. 2
 * division names, shortened for UI use.
 *
 * Source of the code: `vip.aida_company_snapshot.nace_rev_2` (Bureau van
 * Dijk). Everything here is a lookup — no inference, no guessing.
 */

export interface Industry {
  /** 2-digit NACE division, e.g. "22". */
  division: string;
  /** Short label for chips/badges, e.g. "Rubber & plastics". */
  label: string;
}

const NACE_DIVISIONS: Record<string, string> = {
  // Manufacturing (C) — the calibration set lives here
  '10': 'Food products',
  '11': 'Beverages',
  '12': 'Tobacco',
  '13': 'Textiles',
  '14': 'Wearing apparel',
  '15': 'Leather goods',
  '16': 'Wood products',
  '17': 'Paper products',
  '18': 'Printing & media',
  '19': 'Coke & refined petroleum',
  '20': 'Chemicals',
  '21': 'Pharmaceuticals',
  '22': 'Rubber & plastics',
  '23': 'Glass, ceramics & minerals',
  '24': 'Basic metals',
  '25': 'Fabricated metal products',
  '26': 'Electronics & optics',
  '27': 'Electrical equipment',
  '28': 'Machinery & equipment',
  '29': 'Motor vehicles',
  '30': 'Other transport equipment',
  '31': 'Furniture',
  '32': 'Other manufacturing',
  '33': 'Repair & installation of machinery',
  // Occasional neighbours in the snapshot
  '46': 'Wholesale trade',
  '47': 'Retail trade',
  '49': 'Land transport & logistics',
  '58': 'Publishing & software',
  '62': 'IT & programming',
  '63': 'Information services',
  '71': 'Architecture & engineering',
  '72': 'Scientific R&D',
};

/**
 * Resolve a NACE Rev. 2 code (any precision: "22", "222", "22.21") to its
 * division-level industry. Returns null when the code is missing or the
 * division isn't in the table — callers fall back to the raw description.
 */
export function industryFromNace(nace: string | null | undefined): Industry | null {
  if (!nace) return null;
  const division = nace.replace(/\D/g, '').slice(0, 2);
  const label = NACE_DIVISIONS[division];
  return label ? { division, label } : null;
}

/**
 * Best display label for a company's industry: division lookup first,
 * then the AIDA NACE description, then the peer group name.
 */
export function industryLabel(opts: {
  nace?: string | null;
  naceDescription?: string | null;
  peerGroup?: string | null;
}): string | null {
  return (
    industryFromNace(opts.nace)?.label ??
    opts.naceDescription ??
    opts.peerGroup ??
    null
  );
}
