-- =============================================================================
-- VIP · Pivot fix — safe numeric coercion for AIDA snapshot view
-- =============================================================================
--
-- The AIDA dataset uses textual placeholders ("n.a.", "n.s.", "—", "") inside
-- the financial / technological / human / relational JSONB blobs for missing
-- values. The original `aida_company_snapshot` view used
-- `NULLIF(blob->>'key','')::NUMERIC` which only neutralised the empty string,
-- so any "n.a." surfaced as 22P02 "invalid input syntax for type numeric".
--
-- This migration:
--   1. Adds vip._to_numeric(text) — returns NULL unless the input parses as
--      a finite number; otherwise the parsed NUMERIC.
--   2. Rebuilds vip.aida_company_snapshot using the helper for every numeric
--      column. No structural change — same column names, same types.
-- =============================================================================

CREATE OR REPLACE FUNCTION vip._to_numeric(s TEXT)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT CASE
    WHEN s IS NULL THEN NULL
    -- Accept optional sign, optional decimal part. Reject anything else
    -- (covers "n.a.", "n.s.", "—", "", "Yes", etc.).
    WHEN s ~ '^-?[0-9]+(\.[0-9]+)?$' THEN s::NUMERIC
    ELSE NULL
  END
$$;

COMMENT ON FUNCTION vip._to_numeric IS
  'Safe numeric coercion for AIDA JSONB blobs — returns NULL for any non-numeric input including "n.a." placeholders.';

CREATE OR REPLACE VIEW vip.aida_company_snapshot AS
SELECT
  c.tax_code,
  c.company_name,
  c.province,
  c.ateco_2007_code,
  c.ateco_2007_description,
  c.nace_rev_2,
  c.nace_rev_2_description,
  c.peer_group_name,
  c.peer_group_size,
  c.size_estimate,
  c.primary_business_line,
  c.main_products_services,

  -- Financial — last available year + history
  vip._to_numeric(f.data->>'revenues_from_sales_and_services_th_eur_last_avail_yr') AS revenue_last_thk,
  vip._to_numeric(f.data->>'revenues_from_sales_and_services_th_eur_2024')          AS revenue_2024_thk,
  vip._to_numeric(f.data->>'revenues_from_sales_and_services_th_eur_2023')          AS revenue_2023_thk,
  vip._to_numeric(f.data->>'revenues_from_sales_and_services_th_eur_2022')          AS revenue_2022_thk,
  vip._to_numeric(f.data->>'ebitda_th_eur_last_avail_yr')                            AS ebitda_last_thk,
  vip._to_numeric(f.data->>'ebitda_th_eur_2024')                                    AS ebitda_2024_thk,
  vip._to_numeric(f.data->>'ebitda_th_eur_2023')                                    AS ebitda_2023_thk,
  vip._to_numeric(f.data->>'ebitda_th_eur_2022')                                    AS ebitda_2022_thk,
  vip._to_numeric(f.data->>'ebitda_vendite_last_avail_yr')                          AS ebitda_margin_pct,
  vip._to_numeric(f.data->>'profit_loss_th_eur_last_avail_yr')                       AS profit_loss_last_thk,
  vip._to_numeric(f.data->>'total_assets_th_eur_last_avail_yr')                      AS total_assets_thk,
  vip._to_numeric(f.data->>'total_shareholder_s_funds_th_eur_last_avail_yr')         AS equity_thk,
  vip._to_numeric(f.data->>'net_financial_position_th_eur_last_avail_yr')            AS net_financial_position_thk,
  vip._to_numeric(f.data->>'debt_ebitda_ratio_last_avail_yr')                        AS debt_ebitda_ratio,
  vip._to_numeric(f.data->>'cash_flow_from_operating_activities_a_th_eur_last_avail_yr') AS operating_cash_flow_thk,

  -- Technological
  vip._to_numeric(t.data->>'research_and_dev_exp_th_eur_last_avail_yr')              AS rd_expense_thk,
  vip._to_numeric(t.data->>'total_intangible_fixed_assets_th_eur_last_avail_yr')     AS intangible_assets_thk,
  vip._to_numeric(t.data->>'total_tangible_fixed_assets_th_eur_last_avail_yr')       AS tangible_assets_thk,
  vip._to_numeric(t.data->>'ind_patents_and_intellect_property_rights_th_eur_last_avail_yr') AS ip_rights_thk,

  -- Human & Organisational
  vip._to_numeric(h.data->>'number_of_employees_last_avail_yr')                      AS employees,
  vip._to_numeric(h.data->>'turnover_per_employee_eur_last_avail_yr')                AS turnover_per_employee_eur,
  vip._to_numeric(h.data->>'added_value_th_eur_last_avail_yr')                       AS added_value_thk,
  vip._to_numeric(h.data->>'number_of_directors_managers')                           AS director_manager_count,

  -- Relational
  h.data->>'bvd_independence_indicator'                                              AS bvd_independence_indicator,
  r.data->>'main_customers'                                                          AS main_customers,
  r.data->>'main_foreign_countries_or_regions'                                       AS main_foreign_countries,
  r.data->>'main_brand_names'                                                        AS main_brand_names,
  vip._to_numeric(r.data->>'durata_media_dei_crediti_al_lordo_iva_days_last_avail_yr') AS receivables_days,
  vip._to_numeric(r.data->>'durata_media_dei_debiti_al_lordo_iva_days_last_avail_yr')  AS payables_days
FROM vip.context c
LEFT JOIN vip.financial_capital     f ON f.tax_code = c.tax_code
LEFT JOIN vip.technological_capital t ON t.tax_code = c.tax_code
LEFT JOIN vip.human_organisational  h ON h.tax_code = c.tax_code
LEFT JOIN vip.relational_capital    r ON r.tax_code = c.tax_code;

COMMENT ON VIEW vip.aida_company_snapshot IS
  'Per-company flat snapshot of AIDA fields. Numeric casts use vip._to_numeric so "n.a." placeholders never break the query.';
