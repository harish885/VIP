# VIP — SME 4-Capital Valuation

> A strategic valuation framework that turns raw **AIDA / Orbis** SME exports into four capital pillars: **Financial**, **Technological**, **Human & Organisational**, and **Relational**.

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-2ea44f)
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
├── 📂 data/         split spreadsheets — one per capital + combined workbook
├── 📂 docs/         SME_Valuation_Design.pdf · VIP_Build_Plan.pdf · PHASE_03_SETUP.md
├── 📂 src/          split_aida_capitals.py · ingest_aida.py (Phase 03)
├── 📂 supabase/     migrations + config.toml — DB schema lives here (Phase 03)
├── 📂 web/          Next.js 14 production codebase — Phase 02 (marketing) + Phase 03 (Supabase clients)
├── 📄 index.html              cinematic single-file site (visual reference)
├── 📄 infographic.html        static infographic (v2)
├── 📄 infographic-v1.html     backup of static infographic
├── 📄 .env.example            Python-side env template (DATABASE_URL)
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

## The Web App (Phase 02 — full marketing surface live)

The production codebase lives in [`web/`](web/) — Next.js 14 (App Router) + TypeScript + Tailwind + GSAP + Lenis. Phase 02 ships all ten cinematic scenes ported from `index.html` as React components.

```bash
cd web
npm install
npm run dev          # http://localhost:3000
```

Full details in [`web/README.md`](web/README.md). The phased roadmap is in [`docs/VIP_Build_Plan.pdf`](docs/VIP_Build_Plan.pdf).

## Database (Phase 03 — Supabase schema + ingestion)

Schema and Row Level Security live in [`supabase/migrations/`](supabase/migrations). Five calibration tables (the 14,999-SME AIDA dataset, read-only public) plus five user-facing tables (profiles, companies, submissions, valuations, recommendations — RLS-scoped to the owning user).

To stand up the DB, ingest data, and wire the web app, follow [`docs/PHASE_03_SETUP.md`](docs/PHASE_03_SETUP.md) — there are two paths (Supabase Cloud or local Docker). Acceptance check: `SELECT count(*) FROM public.context` returns 14,999.

## Where to Look Next

| Need | File |
|---|---|
| Model rationale & methodology | [`docs/SME_Valuation_Design.pdf`](docs/SME_Valuation_Design.pdf) |
| Full build & execution plan | [`docs/VIP_Build_Plan.pdf`](docs/VIP_Build_Plan.pdf) |
| **Stand up Supabase + ingest AIDA** | [`docs/PHASE_03_SETUP.md`](docs/PHASE_03_SETUP.md) |
| Run the web app | [`web/README.md`](web/README.md) |
| Visual reference for the product | [`index.html`](index.html) — open in any browser |
| DB schema | [`supabase/migrations/`](supabase/migrations/) |
| Exact column list per capital | top of [`src/split_aida_capitals.py`](src/split_aida_capitals.py) |
| The data itself | [`data/`](data/) — open `all_capitals_clean_split.xlsx` for a single-file view |
