# VIP — SME 4-Capital Valuation

> A strategic valuation framework that turns raw **AIDA / Orbis** SME exports into four capital pillars: **Financial**, **Technological**, **Human & Organisational**, and **Relational**.

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-2ea44f)
![License](https://img.shields.io/badge/License-Proprietary-red)
![Data](https://img.shields.io/badge/Dataset-~53MB-blueviolet)

---

## Overview

Italian SME data from AIDA comes as one wide spreadsheet with hundreds of mixed columns. This project splits that export into four focused workbooks — one per capital — each carrying a shared block of *context columns* (company identifiers, sector codes, peer group). The result is a clean, model-aligned dataset the team can analyse, score, and value against.

## The Four Capitals

| | Capital | What it covers |
|---|---|---|
| 🟦 | **Financial** | Profitability, growth, liquidity, leverage, cash-flow quality |
| 🟪 | **Technological** | Fixed & intangible assets, R&D spend, IP, capex intensity |
| 🟧 | **Human & Organisational** | Workforce, productivity, governance, group structure |
| 🟩 | **Relational** | Customers, suppliers, geographic reach, brand, networks |

> Every per-capital file also carries the shared **Context** block (company name, ATECO/NACE codes, peer group, size, etc.) so each file is self-contained for analysis.

## Repository Layout

```
VIP/
├── 📂 data/    split spreadsheets — one per capital + a combined multi-sheet workbook
├── 📂 docs/    SME_Valuation_Design.pdf — the design document for the model
├── 📂 src/     split_aida_capitals.py — the splitter script
├── 📄 requirements.txt
└── 📄 .gitignore
```

## Quick Start

**1. Install dependencies**

```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

**2. Regenerate the splits from a new AIDA export**

```bash
cd src
python split_aida_capitals.py
```

The script will prompt for your export path if it can't find `aida_export.xlsx` in the working directory. Outputs land in `./capital_split_outputs/` (gitignored) — move them into `data/` to update the tracked dataset. Column matching is whitespace-tolerant, so it copes with the embedded newlines AIDA likes to put in headers.

## Where to Look Next

| Need | File |
|---|---|
| Model rationale & methodology | [`docs/SME_Valuation_Design.pdf`](docs/SME_Valuation_Design.pdf) |
| Exact column list per capital | top of [`src/split_aida_capitals.py`](src/split_aida_capitals.py) |
| The data itself | [`data/`](data/) — open `all_capitals_clean_split.xlsx` for a single-file view |
