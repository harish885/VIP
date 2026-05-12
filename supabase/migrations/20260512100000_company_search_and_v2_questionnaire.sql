-- =============================================================================
-- VIP · Pivot · Migration — company search + v2 questionnaire (20-Q)
-- =============================================================================
--
-- Two structural changes to support the new product flow:
--
--   1. companies.tax_code              — FK to vip.context.tax_code, so each
--                                        user "company" can be bound to a row
--                                        in the AIDA calibration set. NULL is
--                                        still allowed (free-form / non-AIDA
--                                        valuation, as in the original flow).
--
--   2. submissions.q*_*                — 8 new 1–5 scored columns covering the
--                                        rest of the 20-Q questionnaire from
--                                        Value_Intelligence_Questionnaire+
--                                        contextdata.docx. The original 6
--                                        qualitative columns (founder_dependency,
--                                        management_structure, digital_maturity,
--                                        client_portfolio_quality,
--                                        business_scalability,
--                                        network_partnerships) stay where they
--                                        are and are re-used as Q5, Q6, Q1,
--                                        Q9, Q14, Q12 respectively.
--
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Link companies to the AIDA calibration row
-- -----------------------------------------------------------------------------
ALTER TABLE vip.companies
  ADD COLUMN IF NOT EXISTS tax_code TEXT
    REFERENCES vip.context(tax_code) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_companies_tax_code ON vip.companies (tax_code);

COMMENT ON COLUMN vip.companies.tax_code IS
  'Optional link to the AIDA calibration row in vip.context — quantitative inputs are pulled from there.';

-- -----------------------------------------------------------------------------
-- 2) Extra scored questions (1–5) on submissions
-- -----------------------------------------------------------------------------
-- Tech (rounds out Q1–Q4 — digital_maturity already covers Q1)
ALTER TABLE vip.submissions
  ADD COLUMN IF NOT EXISTS q_automation              SMALLINT
    CHECK (q_automation BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS q_enabling_systems        SMALLINT
    CHECK (q_enabling_systems BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS q_distinctive_tech_assets SMALLINT
    CHECK (q_distinctive_tech_assets BETWEEN 1 AND 5);

-- Human & Organisational (Q7, Q8 — founder_dep & mgmt_structure cover Q5, Q6)
ALTER TABLE vip.submissions
  ADD COLUMN IF NOT EXISTS q_process_maturity        SMALLINT
    CHECK (q_process_maturity BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS q_transferability         SMALLINT
    CHECK (q_transferability BETWEEN 1 AND 5);

-- Relational (Q10, Q11 — client_portfolio_quality & network_partnerships cover Q9, Q12)
ALTER TABLE vip.submissions
  ADD COLUMN IF NOT EXISTS q_strategic_partnerships  SMALLINT
    CHECK (q_strategic_partnerships BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS q_reputation              SMALLINT
    CHECK (q_reputation BETWEEN 1 AND 5);

-- Growth Quality (Q13 — business_scalability covers Q14)
ALTER TABLE vip.submissions
  ADD COLUMN IF NOT EXISTS q_quality_of_growth       SMALLINT
    CHECK (q_quality_of_growth BETWEEN 1 AND 5);

-- Extended context (Q17 lifecycle 1–5, Q18 distinctive assets 1–5, Q19 M&A 1–5)
ALTER TABLE vip.submissions
  ADD COLUMN IF NOT EXISTS q_lifecycle_score         SMALLINT
    CHECK (q_lifecycle_score BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS q_distinctive_assets_score SMALLINT
    CHECK (q_distinctive_assets_score BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS q_ma_history              SMALLINT
    CHECK (q_ma_history BETWEEN 1 AND 5);

COMMENT ON COLUMN vip.submissions.q_process_maturity IS
  'Q7 — how formalised the company''s processes are (1–5).';
COMMENT ON COLUMN vip.submissions.q_transferability IS
  'Q8 — how easily ownership could be transferred (1–5).';
COMMENT ON COLUMN vip.submissions.q_strategic_partnerships IS
  'Q10 — strength of strategic partnerships (1–5).';
COMMENT ON COLUMN vip.submissions.q_reputation IS
  'Q11 — market reputation / recognition (1–5).';
COMMENT ON COLUMN vip.submissions.q_quality_of_growth IS
  'Q13 — quality / repeatability of growth (1–5).';
COMMENT ON COLUMN vip.submissions.q_lifecycle_score IS
  'Q17 — business lifecycle stage on a 1–5 maturity scale (separate from companies.lifecycle_stage text).';
COMMENT ON COLUMN vip.submissions.q_distinctive_assets_score IS
  'Q18 — strength of distinctive assets (1–5).';
COMMENT ON COLUMN vip.submissions.q_ma_history IS
  'Q19 — prior M&A / exit exposure (1–5).';

-- -----------------------------------------------------------------------------
-- 3) Convenience view — AIDA quant snapshot per company (used by the new
--    /companies pages so they don't re-derive the same JSONB digs twice).
-- -----------------------------------------------------------------------------
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
  NULLIF(f.data->>'revenues_from_sales_and_services_th_eur_last_avail_yr','')::NUMERIC AS revenue_last_thk,
  NULLIF(f.data->>'revenues_from_sales_and_services_th_eur_2024','')::NUMERIC          AS revenue_2024_thk,
  NULLIF(f.data->>'revenues_from_sales_and_services_th_eur_2023','')::NUMERIC          AS revenue_2023_thk,
  NULLIF(f.data->>'revenues_from_sales_and_services_th_eur_2022','')::NUMERIC          AS revenue_2022_thk,
  NULLIF(f.data->>'ebitda_th_eur_last_avail_yr','')::NUMERIC                            AS ebitda_last_thk,
  NULLIF(f.data->>'ebitda_th_eur_2024','')::NUMERIC                                    AS ebitda_2024_thk,
  NULLIF(f.data->>'ebitda_th_eur_2023','')::NUMERIC                                    AS ebitda_2023_thk,
  NULLIF(f.data->>'ebitda_th_eur_2022','')::NUMERIC                                    AS ebitda_2022_thk,
  NULLIF(f.data->>'ebitda_vendite_last_avail_yr','')::NUMERIC                          AS ebitda_margin_pct,
  NULLIF(f.data->>'profit_loss_th_eur_last_avail_yr','')::NUMERIC                       AS profit_loss_last_thk,
  NULLIF(f.data->>'total_assets_th_eur_last_avail_yr','')::NUMERIC                      AS total_assets_thk,
  NULLIF(f.data->>'total_shareholder_s_funds_th_eur_last_avail_yr','')::NUMERIC         AS equity_thk,
  NULLIF(f.data->>'net_financial_position_th_eur_last_avail_yr','')::NUMERIC            AS net_financial_position_thk,
  NULLIF(f.data->>'debt_ebitda_ratio_last_avail_yr','')::NUMERIC                        AS debt_ebitda_ratio,
  NULLIF(f.data->>'cash_flow_from_operating_activities_a_th_eur_last_avail_yr','')::NUMERIC AS operating_cash_flow_thk,
  -- Technological
  NULLIF(t.data->>'research_and_dev_exp_th_eur_last_avail_yr','')::NUMERIC              AS rd_expense_thk,
  NULLIF(t.data->>'total_intangible_fixed_assets_th_eur_last_avail_yr','')::NUMERIC     AS intangible_assets_thk,
  NULLIF(t.data->>'total_tangible_fixed_assets_th_eur_last_avail_yr','')::NUMERIC       AS tangible_assets_thk,
  NULLIF(t.data->>'ind_patents_and_intellect_property_rights_th_eur_last_avail_yr','')::NUMERIC AS ip_rights_thk,
  -- Human & Organisational
  NULLIF(h.data->>'number_of_employees_last_avail_yr','')::NUMERIC                      AS employees,
  NULLIF(h.data->>'turnover_per_employee_eur_last_avail_yr','')::NUMERIC                AS turnover_per_employee_eur,
  NULLIF(h.data->>'added_value_th_eur_last_avail_yr','')::NUMERIC                       AS added_value_thk,
  NULLIF(h.data->>'number_of_directors_managers','')::NUMERIC                           AS director_manager_count,
  -- Relational
  h.data->>'bvd_independence_indicator'                                                AS bvd_independence_indicator,
  r.data->>'main_customers'                                                            AS main_customers,
  r.data->>'main_foreign_countries_or_regions'                                         AS main_foreign_countries,
  r.data->>'main_brand_names'                                                          AS main_brand_names,
  NULLIF(r.data->>'durata_media_dei_crediti_al_lordo_iva_days_last_avail_yr','')::NUMERIC AS receivables_days,
  NULLIF(r.data->>'durata_media_dei_debiti_al_lordo_iva_days_last_avail_yr','')::NUMERIC  AS payables_days
FROM vip.context c
LEFT JOIN vip.financial_capital     f ON f.tax_code = c.tax_code
LEFT JOIN vip.technological_capital t ON t.tax_code = c.tax_code
LEFT JOIN vip.human_organisational  h ON h.tax_code = c.tax_code
LEFT JOIN vip.relational_capital    r ON r.tax_code = c.tax_code;

COMMENT ON VIEW vip.aida_company_snapshot IS
  'Flat per-company snapshot pulling the most-used AIDA fields into typed columns. Read-only.';
