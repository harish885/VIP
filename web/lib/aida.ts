/**
 * AIDA snapshot helpers.
 *
 * Wraps the `vip.aida_company_snapshot` SQL view so the rest of the app
 * can ask for "a company by tax_code" or "a list of companies matching X"
 * without writing JSONB digs inline.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export interface AidaSnapshot {
  tax_code: string;
  company_name: string;
  province: string | null;
  ateco_2007_code: string | null;
  ateco_2007_description: string | null;
  nace_rev_2: string | null;
  nace_rev_2_description: string | null;
  peer_group_name: string | null;
  peer_group_size: string | null;
  size_estimate: string | null;
  primary_business_line: string | null;
  main_products_services: string | null;

  // Financial (k EUR)
  revenue_last_thk: number | null;
  revenue_2024_thk: number | null;
  revenue_2023_thk: number | null;
  revenue_2022_thk: number | null;
  ebitda_last_thk: number | null;
  ebitda_2024_thk: number | null;
  ebitda_2023_thk: number | null;
  ebitda_2022_thk: number | null;
  ebitda_margin_pct: number | null;
  profit_loss_last_thk: number | null;
  total_assets_thk: number | null;
  equity_thk: number | null;
  net_financial_position_thk: number | null;
  debt_ebitda_ratio: number | null;
  operating_cash_flow_thk: number | null;

  // Technological
  rd_expense_thk: number | null;
  intangible_assets_thk: number | null;
  tangible_assets_thk: number | null;
  ip_rights_thk: number | null;

  // Human & Organisational
  employees: number | null;
  turnover_per_employee_eur: number | null;
  added_value_thk: number | null;
  director_manager_count: number | null;
  bvd_independence_indicator: string | null;

  // Relational
  main_customers: string | null;
  main_foreign_countries: string | null;
  main_brand_names: string | null;
  receivables_days: number | null;
  payables_days: number | null;
}

export type ServiceClient = SupabaseClient<Database, 'vip'>;

const SNAPSHOT_VIEW = 'aida_company_snapshot' as const;

export type SearchOutcome =
  | { ok: true; results: AidaSnapshot[] }
  | { ok: false; error: 'schema_not_exposed' | 'view_missing' | 'other'; message: string };

/**
 * Search AIDA companies by company name, tax code, NACE-rev-2 code or
 * province. One typed term is matched (OR) across all four columns so
 * a single search box covers every practical lookup.
 *
 * Examples: "huni" → name · "57294" → tax-code prefix · "31" → NACE
 * prefix · "Bergamo" → province.
 */
export async function searchCompanies(
  service: ServiceClient,
  q: string,
  limit = 25,
): Promise<SearchOutcome> {
  const trimmed = q.trim();
  const builder = service
    .from(SNAPSHOT_VIEW as unknown as 'context')
    .select(
      `tax_code, company_name, province, ateco_2007_code, ateco_2007_description,
       nace_rev_2, peer_group_name, size_estimate, primary_business_line,
       revenue_last_thk, ebitda_last_thk, ebitda_margin_pct, employees`,
    )
    .limit(limit);

  // Strip characters that have special meaning inside PostgREST `or()`.
  const escaped = trimmed.replace(/[,()*]/g, ' ').trim();

  const filtered = escaped.length === 0
    ? builder.order('revenue_last_thk', { ascending: false, nullsFirst: false })
    : builder
        .or(
          [
            `company_name.ilike.%${escaped}%`,
            `tax_code.ilike.${escaped}%`,
            `nace_rev_2.ilike.${escaped}%`,
            `province.ilike.%${escaped}%`,
          ].join(','),
        )
        .order('company_name');

  const { data, error } = await filtered;
  if (error) {
    console.error('[aida.searchCompanies] query failed:', error);
    if (error.code === 'PGRST106') {
      return {
        ok: false,
        error: 'schema_not_exposed',
        message:
          'Supabase: the `vip` schema is not exposed. ' +
          'Open the Supabase Dashboard → Settings → API → Exposed schemas → add "vip", then save.',
      };
    }
    if (error.code === '42P01') {
      return {
        ok: false,
        error: 'view_missing',
        message:
          'Supabase: the `vip.aida_company_snapshot` view is missing. Apply ' +
          'supabase/migrations/20260512100000_company_search_and_v2_questionnaire.sql.',
      };
    }
    return { ok: false, error: 'other', message: error.message };
  }
  return { ok: true, results: (data ?? []) as unknown as AidaSnapshot[] };
}

export async function getCompanySnapshot(
  service: ServiceClient,
  taxCode: string,
): Promise<AidaSnapshot | null> {
  const { data, error } = await service
    .from(SNAPSHOT_VIEW as unknown as 'context')
    .select('*')
    .eq('tax_code', taxCode)
    .single();
  if (error) {
    console.error('[aida.getCompanySnapshot] failed for', taxCode, error);
    if (error.code === 'PGRST106') {
      console.error(
        '[aida.getCompanySnapshot] The `vip` schema is not exposed. ' +
        'Supabase Dashboard → Settings → API → Exposed schemas → add "vip".',
      );
    }
    return null;
  }
  return (data ?? null) as unknown as AidaSnapshot | null;
}
