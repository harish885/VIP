# AIDA — SME 4-Capital Valuation Dataset

This repository contains the data and tooling used to split an AIDA / Orbis SME export into a **4-Capital strategic valuation model**:

1. Financial Capital
2. Technological Capital
3. Human & Organisational Capital
4. Relational Capital

A shared block of *context columns* (company identifiers, sector codes, peer group, etc.) is included in every per-capital file and on every sheet of the combined workbook.

## Repository layout

```
AIDA/
├── README.md
├── .gitignore
├── requirements.txt
├── data/
│   ├── all_capitals_clean_split.xlsx        # Combined multi-sheet workbook
│   ├── context_columns.xlsx                  # Context columns only
│   ├── financial_capital.xlsx                # Context + Financial Capital
│   ├── technological_capital.xlsx            # Context + Technological Capital
│   ├── human_organisational_capital.xlsx     # Context + Human & Organisational
│   └── relational_capital.xlsx               # Context + Relational Capital
├── docs/
│   └── SME_Valuation_Design.pdf              # Design document for the model
└── src/
    └── split_aida_capitals.py                # Splitter script
```

## Setup

```bash
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Regenerating the per-capital files

The files in `data/` were produced by `src/split_aida_capitals.py` from a consolidated AIDA export. To regenerate them from a new export:

1. Place your raw AIDA export at the path configured in the script (default: `aida_export.xlsx` in the working directory), or pass the path interactively when prompted.
2. Run the script:

   ```bash
   cd src
   python split_aida_capitals.py
   ```

3. Outputs are written to `./capital_split_outputs/` (gitignored). Move them into `data/` to update the tracked dataset.

The script is whitespace-tolerant when matching column headers (it handles newlines embedded in AIDA-exported headers) and prints a summary of which columns were found vs. missing for each capital group.

## Column groups

The exact column lists for each of the four capitals — and the shared context block — are defined at the top of `src/split_aida_capitals.py`. Edit them there if your export's schema changes.

## Notes on data files

The `.xlsx` files in `data/` are the source of truth for the split dataset and are committed directly to the repository. They are non-trivial in size (~50 MB total); if the repo grows further, consider migrating them to Git LFS.

