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

## The Web App — Phases 00 → 09 shipped

The production codebase lives in [`web/`](web/) — Next.js 14 (App Router) + TypeScript strict + Tailwind + GSAP for radar / count-ups / capital bars.

Status table is in [`CLAUDE.md`](CLAUDE.md). Headline:

| Layer | What ships |
|---|---|
| Marketing site | 10 scenes, fade-up on scroll |
| 4-step diagnostic | Zod + React Hook Form, 17 inputs |
| Scoring pipeline | `web/lib/scoring/` — 6 stages, shared TS module |
| Dashboard | Async server component reading `vip.valuations` |
| Recommendations | ROV-ranked Top-3 written to `vip.recommendations` |
| Simulation | Live sliders, V recomputes client-side in < 1 ms |

### Run it locally (no Vercel, no GitHub push required)

**1. One-time setup** — applies migrations + ingests the 14 999-row calibration set.
Follow [`docs/PHASE_03_SETUP.md`](docs/PHASE_03_SETUP.md). Then apply the Phase 06 migration:

```bash
# Inside your Supabase project (cloud or local)
psql "$DATABASE_URL" -f supabase/migrations/20260512000000_demo_mode_and_percentile.sql
```

(The scoring engine still runs with synthetic priors if you skip this — only the *peer-percentile* lookup and *demo-mode anonymous writes* require it.)

**2. Web app**

```bash
cp web/.env.example web/.env.local       # paste your Supabase URL + keys
cd web
npm install
npm run dev          # http://localhost:3000
```

**3. Try the full loop**

1. Open `http://localhost:3000` → click **Open Dashboard** → land on the seeded ACME view.
2. Click **Run new diagnostic** → fill the 4 steps (or hit **Fill with example** for the ACME profile).
3. Submit → the server action scores your inputs, writes a `vip.valuations` row, and redirects to `/dashboard?submitted=…`.
4. Dashboard renders your numbers, your Top-3 recommendations, and your interactive simulation sliders.

**4. Verify**

```bash
cd web
npm run type-check         # tsc --noEmit, strict + noUncheckedIndexedAccess
npm run lint               # next lint
npx tsx scripts/calibrate-acme.ts             # ACME scoring lands ±10% of demo
npx tsx scripts/calibrate-recommendations.ts  # Top-3 = client_conc, recurring, mgmt
```

Auth is intentionally bypassed — `ENFORCE_AUTH_GUARDS = false` in [`web/lib/supabase/middleware.ts`](web/lib/supabase/middleware.ts). Demo submissions persist anonymously via a service-role write and a short-lived httpOnly cookie. Flip the flag to re-enable the (already-built) auth pages.

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
