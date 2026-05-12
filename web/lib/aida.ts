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

export async function searchCompanies(
  service: ServiceClient,
  q: string,
  limit = 25,
): Promise<AidaSnapshot[]> {
  const trimmed = q.trim();
  // Match on company name (case-insensitive), fall back to tax_code prefix.
  const builder = service
    // The generated types don't know about the view (it's not a table);
    // cast through `as unknown` so the typed schema stays clean while we
    // still get a typed result by stating it inline.
    .from(SNAPSHOT_VIEW as unknown as 'context')
    .select(
      `tax_code, company_name, province, ateco_2007_code, ateco_2007_description,
       nace_rev_2, peer_group_name, size_estimate, primary_business_line,
       revenue_last_thk, ebitda_last_thk, ebitda_margin_pct, employees`,
    )
    .limit(limit);

  const filtered = trimmed.length === 0
    ? builder.order('revenue_last_thk', { ascending: false, nullsFirst: false })
    : builder.ilike('company_name', `%${trimmed}%`).order('company_name');

  const { data, error } = await filtered;
  if (error || !data) return [];
  return data as unknown as AidaSnapshot[];
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
  if (error || !data) return null;
  return data as unknown as AidaSnapshot;
}
