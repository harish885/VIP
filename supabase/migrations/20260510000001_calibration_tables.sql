-- =============================================================================
-- VIP · Phase 03 · Migration 01 — Calibration tables
-- =============================================================================
--
-- Stores the AIDA / Bureau van Dijk calibration set: 14,999 Italian SMEs in
-- NACE 28xx (Machinery & Equipment manufacturing). Used to compute peer-group
-- percentile ranks during the scoring pipeline (Phase 06).
--
-- Layout:
--   `context`             — one row per company. Typed identifier columns.
--   `financial_capital`   — one row per company. JSONB blob of AIDA financial fields.
--   `technological_capital`
--   `human_organisational`
--   `relational_capital`
--
-- Why JSONB for capital tables: the AIDA exports carry ~40 fields per capital
-- with names like "EBITDA th EUR Last avail. yr" — awkward as SQL columns.
-- JSONB lets us ingest fast, normalise keys (snake_case) on the way in, and
-- still index/query specific fields via Postgres JSON operators.
--
-- These tables are READ-ONLY from the client. Only the service role (the
-- ingestion script) writes here. See RLS migration 03 for policy details.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- context · company directory + AIDA metadata
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vip.context (
  tax_code                  TEXT PRIMARY KEY,
  company_name              TEXT NOT NULL,
  province                  TEXT,
  accounting_closing_date   DATE,
  cciaa_number              TEXT,
  primary_business_line     TEXT,
  main_activity             TEXT,
  ateco_2007_code           TEXT,
  ateco_2007_description    TEXT,
  nace_rev_2                TEXT,
  nace_rev_2_description    TEXT,
  peer_group_name           TEXT,
  peer_group_description    TEXT,
  peer_group_size           TEXT,
  main_products_services    TEXT,
  size_estimate             TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE vip.context IS
  'AIDA calibration set — one row per Italian SME with sector + peer-group metadata.';

-- Indexes for the queries we will actually run during scoring.
CREATE INDEX IF NOT EXISTS idx_context_peer_group_name ON vip.context (peer_group_name);
CREATE INDEX IF NOT EXISTS idx_context_nace_rev_2      ON vip.context (nace_rev_2);
CREATE INDEX IF NOT EXISTS idx_context_ateco_code      ON vip.context (ateco_2007_code);
CREATE INDEX IF NOT EXISTS idx_context_size_estimate   ON vip.context (size_estimate);

-- -----------------------------------------------------------------------------
-- Capital tables · one row per company, AIDA fields as JSONB
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vip.financial_capital (
  tax_code    TEXT PRIMARY KEY REFERENCES vip.context(tax_code) ON DELETE CASCADE,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE vip.financial_capital IS
  'AIDA financial-capital fields (revenue, EBITDA, leverage, liquidity, cash flow) per company as JSONB.';

CREATE TABLE IF NOT EXISTS vip.technological_capital (
  tax_code    TEXT PRIMARY KEY REFERENCES vip.context(tax_code) ON DELETE CASCADE,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE vip.technological_capital IS
  'AIDA technological-capital fields (fixed assets, IP, R&D, capex intensity) per company as JSONB.';

CREATE TABLE IF NOT EXISTS vip.human_organisational (
  tax_code    TEXT PRIMARY KEY REFERENCES vip.context(tax_code) ON DELETE CASCADE,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE vip.human_organisational IS
  'AIDA human & organisational-capital fields (workforce, governance, group structure) per company as JSONB.';

CREATE TABLE IF NOT EXISTS vip.relational_capital (
  tax_code    TEXT PRIMARY KEY REFERENCES vip.context(tax_code) ON DELETE CASCADE,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE vip.relational_capital IS
  'AIDA relational-capital fields (customers, brands, internationalisation, working capital) per company as JSONB.';

-- -----------------------------------------------------------------------------
-- Helpful view · joined "wide" calibration row for ad-hoc inspection
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vip.calibration_wide AS
  SELECT
    c.*,
    f.data AS financial,
    t.data AS technological,
    h.data AS human_organisational,
    r.data AS relational
  FROM vip.context c
  LEFT JOIN vip.financial_capital      f ON f.tax_code = c.tax_code
  LEFT JOIN vip.technological_capital  t ON t.tax_code = c.tax_code
  LEFT JOIN vip.human_organisational   h ON h.tax_code = c.tax_code
  LEFT JOIN vip.relational_capital     r ON r.tax_code = c.tax_code;

COMMENT ON VIEW vip.calibration_wide IS
  'Joined calibration row — context columns plus four capital JSONB blobs. Read-only convenience view.';
