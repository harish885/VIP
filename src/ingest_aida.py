"""
ingest_aida.py
==============

Loads the AIDA calibration dataset (14,999 SMEs) into Supabase.

Reads:
    data/all_capitals_clean_split.xlsx

Writes to (UPSERT — re-runnable):
    vip.context              · 16 typed columns
    vip.financial_capital    · tax_code + JSONB(data)
    vip.technological_capital
    vip.human_organisational
    vip.relational_capital

Configuration via environment variables (.env at project root):
    DATABASE_URL    — full Postgres connection string from Supabase
                      (Settings → Database → Connection string → URI mode).

Usage:
    pip install -r requirements.txt
    python src/ingest_aida.py            # ingest everything
    python src/ingest_aida.py --dry-run  # parse only, no DB writes

Acceptance check:
    SELECT count(*) FROM vip.context;   -- expect 14,999
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

import pandas as pd

try:
    import psycopg
    from psycopg import sql
except ImportError:
    sys.exit("psycopg not installed. Run: pip install -r requirements.txt")

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # dotenv is optional — env can be set externally
    pass


# =============================================================================
# CONFIG
# =============================================================================
INPUT_FILE = Path(__file__).resolve().parent.parent / "data" / "all_capitals_clean_split.xlsx"

CAPITAL_SHEETS = {
    "financial_capital":      "Financial Capital",
    "technological_capital":  "Technological Capital",
    "human_organisational":   "Human & Organisational Capital",
    "relational_capital":     "Relational Capital",
}

# AIDA context column → snake_case DB column (mirrors migrations/01)
CONTEXT_MAP: dict[str, str] = {
    "Company name":                              "company_name",
    "Province":                                  "province",
    "Accounting closing date Last avail. yr":    "accounting_closing_date",
    "Tax code number":                           "tax_code",
    "CCIAA number":                              "cciaa_number",
    "Primary business line":                     "primary_business_line",
    "Main activity":                             "main_activity",
    "ATECO 2007 code":                           "ateco_2007_code",
    "ATECO 2007 description":                    "ateco_2007_description",
    "NACE Rev. 2":                               "nace_rev_2",
    "NACE Rev. 2 description":                   "nace_rev_2_description",
    "Peer Group Name":                           "peer_group_name",
    "Peer Group Description":                    "peer_group_description",
    "Peer Group Size":                           "peer_group_size",
    "Main products and services":                "main_products_services",
    "Size estimate":                             "size_estimate",
}

# =============================================================================
# HELPERS
# =============================================================================
def _clean_col(c: Any) -> str:
    """AIDA exports embed newlines in headers. Collapse whitespace."""
    return re.sub(r"\s+", " ", str(c)).strip()


def _snake(name: str) -> str:
    """Normalise an AIDA column name to a snake_case JSON key."""
    s = _clean_col(name).lower()
    s = re.sub(r"[^a-z0-9]+", "_", s).strip("_")
    return s


def _safe_value(v: Any) -> Any:
    """Convert pandas/numpy values to JSON-safe Python values."""
    if v is None or (isinstance(v, float) and v != v):  # NaN
        return None
    if isinstance(v, pd.Timestamp):
        return v.date().isoformat()
    if hasattr(v, "item"):  # numpy scalar
        v = v.item()
    if isinstance(v, float) and v != v:  # NaN after .item()
        return None
    return v


def _row_to_jsonb(row: pd.Series, columns: list[str]) -> dict[str, Any]:
    """Build a JSON-safe dict from a DataFrame row, dropping NaNs."""
    out: dict[str, Any] = {}
    for col in columns:
        v = _safe_value(row.get(col))
        if v is None:
            continue
        out[_snake(col)] = v
    return out


# =============================================================================
# MAIN
# =============================================================================
def run(dry_run: bool = False) -> int:
    if not INPUT_FILE.exists():
        sys.exit(f"Input not found: {INPUT_FILE}\n"
                 "Run src/split_aida_capitals.py first to generate it, or "
                 "place the workbook at the expected path.")

    db_url = os.environ.get("DATABASE_URL")
    if not dry_run and not db_url:
        sys.exit("Set DATABASE_URL in .env (see docs/PHASE_03_SETUP.md).")

    print(f"Reading {INPUT_FILE.name} ...")
    sheets: dict[str, pd.DataFrame] = pd.read_excel(INPUT_FILE, sheet_name=None)
    for name, df in sheets.items():
        df.columns = [_clean_col(c) for c in df.columns]

    if "Context" not in sheets:
        sys.exit(f"Missing 'Context' sheet. Found sheets: {list(sheets.keys())}")

    ctx_df = sheets["Context"]
    print(f"  Loaded Context: {len(ctx_df):,} rows × {len(ctx_df.columns)} cols")

    # ---- Build context payload ----------------------------------------------
    available_ctx_cols = [c for c in CONTEXT_MAP if c in ctx_df.columns]
    db_ctx_cols = [CONTEXT_MAP[c] for c in available_ctx_cols]
    missing_ctx = set(CONTEXT_MAP) - set(available_ctx_cols)
    if missing_ctx:
        print(f"  ⚠ Context columns not found in input (will be NULL): {sorted(missing_ctx)}")

    ctx_payload: list[tuple[Any, ...]] = []
    for _, r in ctx_df.iterrows():
        tax_code = _safe_value(r.get("Tax code number"))
        if not tax_code:
            continue
        row_vals = tuple(_safe_value(r.get(c)) for c in available_ctx_cols)
        ctx_payload.append(row_vals)

    print(f"  → {len(ctx_payload):,} context rows ready")

    # ---- Build per-capital JSONB payloads ------------------------------------
    capital_payloads: dict[str, list[tuple[str, str]]] = {}
    for table, sheet in CAPITAL_SHEETS.items():
        if sheet not in sheets:
            print(f"  ⚠ Sheet '{sheet}' not in input — skipping {table}")
            capital_payloads[table] = []
            continue
        df = sheets[sheet]
        capital_cols = [c for c in df.columns if c not in CONTEXT_MAP]
        rows: list[tuple[str, str]] = []
        for _, r in df.iterrows():
            tax_code = _safe_value(r.get("Tax code number"))
            if not tax_code:
                continue
            data = _row_to_jsonb(r, capital_cols)
            rows.append((str(tax_code), json.dumps(data, ensure_ascii=False)))
        capital_payloads[table] = rows
        print(f"  → {table}: {len(rows):,} rows · {len(capital_cols)} possible JSON keys per row")

    if dry_run:
        print("\n--dry-run: no DB writes performed.")
        return 0

    # ---- Connect and write ---------------------------------------------------
    assert db_url is not None
    print(f"\nConnecting to Supabase Postgres ...")
    with psycopg.connect(db_url, autocommit=False) as conn:
        with conn.cursor() as cur:
            # ---------- context upsert ----------
            print(f"\n→ vip.context  ({len(ctx_payload):,} rows)")
            cols_sql = sql.SQL(", ").join(sql.Identifier(c) for c in db_ctx_cols)
            placeholders = sql.SQL(", ").join([sql.Placeholder()] * len(db_ctx_cols))
            updates_sql = sql.SQL(", ").join(
                sql.SQL("{} = EXCLUDED.{}").format(sql.Identifier(c), sql.Identifier(c))
                for c in db_ctx_cols if c != "tax_code"
            )
            ctx_query = sql.SQL(
                "INSERT INTO vip.context ({cols}) VALUES ({vals}) "
                "ON CONFLICT (tax_code) DO UPDATE SET {updates}"
            ).format(cols=cols_sql, vals=placeholders, updates=updates_sql)
            cur.executemany(ctx_query, ctx_payload)

            # ---------- capital tables ----------
            for table, rows in capital_payloads.items():
                if not rows:
                    continue
                print(f"→ vip.{table}  ({len(rows):,} rows)")
                q = sql.SQL(
                    "INSERT INTO vip.{} (tax_code, data) VALUES (%s, %s::jsonb) "
                    "ON CONFLICT (tax_code) DO UPDATE SET data = EXCLUDED.data"
                ).format(sql.Identifier(table))
                cur.executemany(q, rows)

        conn.commit()

    print("\n✓ Ingestion complete.\n")
    print("Verify with:")
    print("  psql $DATABASE_URL -c 'SELECT count(*) FROM vip.context;'")
    print("  → should return ≈ 14,999")
    return 0


# =============================================================================
# CLI
# =============================================================================
def main() -> None:
    p = argparse.ArgumentParser(description="Load AIDA calibration data into Supabase.")
    p.add_argument("--dry-run", action="store_true",
                   help="Parse the workbook and report counts; do not write to DB.")
    args = p.parse_args()
    sys.exit(run(dry_run=args.dry_run))


if __name__ == "__main__":
    main()
