---
name: VIP — Value Intelligence Platform
description: A strategist's cockpit for SME enterprise valuation. Calm, dense, every number sourced.
colors:
  page-bg:        "#f7f9fb"
  surface-raised: "#ffffff"
  surface-tinted: "#f1f5f9"
  surface-pressed: "#e2e8f0"
  line:           "#dde2e8"
  line-strong:    "#c7d1db"
  line-faint:     "#ebeff3"
  ink:            "#181a1f"
  ink-soft:       "#3a3e48"
  text-dim:       "#565a66"
  text-faint:     "#8c8e98"
  gold:           "#a66f18"
  gold-soft:      "#ca9743"
  cyan:           "#0c707c"
  cyan-soft:      "#379aa6"
  purple:         "#5e58c4"
  purple-soft:    "#7c78da"
  green:          "#187949"
  green-soft:     "#4fa873"
  red:            "#b8453e"
  orange:         "#b86b3a"
  blue:           "#2a5fa0"
  cap-fin:        "#2a5fa0"
  cap-tech:       "#5b5fd6"
  cap-human:      "#b86b3a"
  cap-rel:        "#1e7a44"
typography:
  display:
    fontFamily: "Fraunces, ui-serif, serif"
    fontSize: "clamp(2.125rem, 5vw, 4rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Fraunces, ui-serif, serif"
    fontSize: "clamp(1.625rem, 3.4vw, 2.625rem)"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Fraunces, ui-serif, serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  metric:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.22em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-primary-hover:
    backgroundColor: "{colors.gold-soft}"
  button-subtle:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-dim}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  button-danger:
    backgroundColor: "{colors.red}"
    textColor: "{colors.red}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  surface-raised:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.lg}"
    padding: "20px"
  surface-tinted:
    backgroundColor: "{colors.surface-tinted}"
    rounded: "{rounded.lg}"
    padding: "20px"
  source-badge-aida:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.cyan}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  source-badge-override:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  status-badge-info:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.cyan}"
    rounded: "999px"
    padding: "2px 10px"
  input-text:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: VIP — Value Intelligence Platform

## 1. Overview

**Creative North Star: "The Strategist's Cockpit"**

VIP is a single-session valuation tool for SME founders. The interface
behaves like a senior strategist's notebook: every figure is sourced,
every formula is auditable, no decoration goes unjustified. Density is
welcomed because the audience reads EBITDA for breakfast; visual
restraint is welcomed because the data itself carries the drama.

The palette is a cool off-white workstation, not a warm magazine. Gold
carries valuation, cyan carries evidence, purple carries computed
quantities, green carries upside, red carries risk. The four capital
pillars get their own hue assignments (`cap-fin` prussian blue,
`cap-tech` indigo, `cap-human` sienna, `cap-rel` emerald) so the
radar reads as four distinct signals rather than one gold polygon.

What this system rejects, in PRODUCT.md's words: generic SaaS
dashboards with purple-and-blue gradient hero strips; AI / crypto
landing-page glow, particles, and "AI-powered" copy; the 2026
AI-default warm-neutral palette (cream / sand / paper / parchment);
cinematic scrollytelling inside product surfaces (Lenis, GSAP
timelines, side-nav dots).

**Key Characteristics:**
- Cool off-white body background tinted toward the brand's own gold.
- Three type families on a contrast axis: Fraunces serif for value
  statements, Inter sans for body, JetBrains Mono for sourced metrics.
- One `Surface` per panel, three tones (raised, tinted, plain). Never
  nest two raised surfaces.
- Every figure carries a `SourceBadge`; every figure is one click away
  from a popover that shows the literal calculation.
- Motion is informative only: `useReveal` fade-up, `animateCount`
  KPIs, radar polygon morph. `prefers-reduced-motion` collapses all
  of it to instant.

## 2. Colors

The palette is role-based, not decorative: a colour identifies the
*kind* of information rather than ornamenting the surface.

### Primary
- **Cockpit Gold** (`#a66f18`): valuation, money, headline value. The
  enterprise-value tile, the gold-bordered "Run diagnostic" CTA, the
  `SourceBadge` for entrepreneur overrides, the `RatingDots` selected
  state, the simulation slider track. Used on ≤10% of any given
  screen; rarity is the point.
- **Cockpit Gold Soft** (`#ca9743`): hover state for primary CTAs,
  gradient companion on the `text-gradient-gold` italic accent.

### Secondary
- **Evidence Cyan** (`#0c707c`): data provenance and AIDA-sourced
  facts. The `SourceBadge`'s AIDA chip, the diagnostic interview's
  eyebrow line, the `Updated recently` status badge.
- **Method Purple** (`#5e58c4`): computed quantities, methodology
  callouts, simulation `live` indicator. Carries the
  `SourceBadge`'s "Computed" tone.

### Tertiary
- **Upside Green** (`#187949`): positive ΔV, recommended actions,
  scenario-lab `Δ vs current` when positive.
- **Risk Red** (`#b8453e`): fragility flags, validation errors,
  destructive confirmations on the reset button. Pairs with text
  every time it appears; colour is never the only signal.

### Neutral
- **Page Background** (`#f7f9fb`): the entire viewport. A cool
  off-white, never warm beige.
- **Surface Raised** (`#ffffff`): the panel layer that sits on the
  page. The Passport, the KPI strip, the cockpit Surfaces, the
  diagnostic question cards.
- **Surface Tinted** (`#f1f5f9`): the inner contrast layer when a
  raised surface needs a sub-panel (the diagnostic question rows,
  the SQF readout chip, the Method tab's "Data sources" panel).
- **Surface Pressed** (`#e2e8f0`): rare; rating dots' inactive ring,
  segmented-tab inactive background.
- **Line** (`#dde2e8`), **Line Strong** (`#c7d1db`), **Line Faint**
  (`#ebeff3`): borders and dividers, dim to vivid.
- **Ink** (`#181a1f`): all body copy, every headline, every value
  number.
- **Text Dim** (`#565a66`): supporting copy, sub-labels, hint text.
- **Text Faint** (`#8c8e98`): eyebrows, captions, ancillary meta.

### Capital Colours (data-viz only)
- **Financial** `#2a5fa0` prussian blue · **Technological** `#5b5fd6`
  indigo · **Human & Organisational** `#b86b3a` sienna · **Relational**
  `#1e7a44` emerald. These are reserved for the capital radar,
  capital bars, and capital legend dots. Do not borrow them for
  generic UI.

### Named Rules
**The One Voice Rule.** Cockpit Gold appears on ≤10% of any given
screen. Its rarity is what makes the headline V tile read as the
answer. The moment two surfaces fight for "primary", neither wins.

**The Source Trio Rule.** Gold (You), Cyan (AIDA), Purple (Computed)
are the only colours allowed inside a `SourceBadge`. Never use them
on a fourth meaning. The chip is a contract with the reader.

**The Cool-Off-White Rule.** The page body is `#f7f9fb`. Forbidden:
any warm-neutral background in the OKLCH L 0.84-0.97, C < 0.06,
hue 40-100 band (cream / sand / paper / parchment / ivory). That's
the 2026 AI default and it is not us.

## 3. Typography

**Display Font:** Fraunces (with `ui-serif, serif` fallback).
**Body Font:** Inter (with `system-ui, sans-serif` fallback).
**Label / Mono Font:** JetBrains Mono (with `ui-monospace, monospace`
fallback).

**Character:** A serif + sans + mono pairing on three different
contrast axes. Fraunces carries weight on every number that matters
(enterprise value, capital scores, V_potential). Inter carries the
reading layer. JetBrains Mono carries every metric, source badge,
eyebrow, and tax-code — the visual signal for "this number was
measured, not written."

### Hierarchy
- **Display** (Fraunces 400, `clamp(2.125rem, 5vw, 4rem)`, line
  1.0, tracking -0.02em): marketing-scene headlines, the empty-state
  hero. Caps at 4rem so the page never shouts.
- **Headline** (Fraunces 500, `clamp(1.625rem, 3.4vw, 2.625rem)`,
  line 1.05, tracking -0.02em): page H1 inside the workspace, the
  diagnostic interview header. `text-wrap: balance` recommended.
- **Title** (Fraunces 500, 20px / 1.25rem, line 1.15): every
  `SectionHeader` title, KPI value text inside `StatCell`.
- **Body** (Inter 400, 13px / 0.8125rem, line 1.55): the working
  layer. Description paragraphs cap at 65–75ch.
- **Metric** (JetBrains Mono 600, 13px, line 1.4): every value that
  came from a source — money, percentages, tax codes, NACE codes,
  source-badge text, eyebrow labels.
- **Label** (JetBrains Mono 700, 10px, line 1.2, tracking 0.22em,
  uppercase): the `eyebrow` utility. Used sparingly per the rule
  below.

### Named Rules
**The Mono-Carries-Truth Rule.** If a string is a measurement (€,
%, ratio, code, ID), set it in JetBrains Mono. Body Inter is for
prose; Fraunces is for headlines and value statements. Mixing
turns the audit trail noisy.

**The Eyebrow-Earns-Its-Place Rule.** Tiny uppercase tracked labels
exist for the cockpit's named pillars (Public factsheet, Value
bridge, Capital constellation, Strategy board) and for source
badges. They are forbidden as an eyebrow on every section across
the marketing site; that's the saturated 2023 AI scaffold.

**The Founder-Readable Rule.** Body text capped at 65–75ch. No
all-caps body copy. Display ceiling 4rem. Body Inter colour is
`--text` (#181a1f), never lighter; supporting copy is
`--text-dim` (#565a66). Anything paler fails the WCAG 4.5:1 line.

## 4. Elevation

Flat by default, with one subtle ambient shadow on raised surfaces
and a heavier shadow only on the `InfoButton` popover. Depth is
mostly carried by the surface-raised / surface-tinted contrast and
by line-faint dividers, not by drop shadows.

### Shadow Vocabulary
- **Surface ambient** (`box-shadow: 0 1px 2px rgba(0,0,0,0.03)`):
  the raised `Surface` tone. Reads as a sheet sitting on the page,
  not as a card "popping out".
- **Popover lift** (`box-shadow: 0 10px 28px rgba(0,0,0,0.18)`):
  reserved for the `InfoButton` portal popover and the search
  autocomplete dropdown. These leave the document flow and need to
  earn their elevation.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. A
`raised` surface gets a 1px-radius ambient shadow only because it
sits on a tinted page background and needs a hairline of separation.
A `tinted` surface gets no shadow.

**The No-Glow Rule.** No box-shadows tinted with brand colour, no
glow halos, no neon outlines. The surface either is flat or it is
a popover that needed to lift; nothing in between.

## 5. Components

### Buttons
Single recipe lives at `web/components/vip-ui/button.tsx` with four
tones and three sizes. All variants share a 150ms colour-only
transition and a focus ring `ring-2 ring-gold/40 ring-offset-1
ring-offset-bg-1`.

- **Shape:** rounded-md (6px) at sm/md, rounded-lg (8px) at lg.
- **Primary** (`tone="primary"`): gold border + 14% gold fill + gold
  text. Hover: 22% gold fill. Used for the canonical CTA per screen
  (Run diagnostic, Continue, Submit).
- **Subtle** (`tone="subtle"`): line border + surface-raised fill +
  text-dim text. Hover: text + line-strong. Used for secondary
  actions (Back, Pre-fill from AIDA, Edit step 1).
- **Ghost** (`tone="ghost"`): no border, no fill, text-dim text.
  Hover: bg-2/60 fill. Used inside dense panels where a button-shaped
  element would crowd.
- **Danger** (`tone="danger"`): red border + 8% red fill + red text.
  Used only on the Reset confirm second-click state.
- **Disabled:** opacity 0.5, pointer-events none, cursor not-allowed.

### Chips
- **`SourceBadge`** (`web/components/vip-ui/source-badge.tsx`): the
  signature component. Rounded-md, 1px border in the source colour,
  8% fill, mono 9.5px 600. Three valid sources (`aida`, `override`,
  `computed`, `proxy`). Carries an inline icon (Database, PenLine,
  Sigma) so colour is never alone.
- **`StatusBadge`** (`status-badge.tsx`): rounded-full pill, 1px
  border, 7% fill, mono 10px 600 uppercase. Used for "Diagnosed
  · 6h ago", "Updated recently", "Risk · MEDIUM".

### Cards / Containers
- **`Surface`** (`vip-ui/surface.tsx`): the only container primitive
  on the workspace. Three tones (`raised` = white + ambient shadow;
  `tinted` = surface-tinted fill, no shadow; `plain` = white, no
  shadow). Rounded-lg (8px) by default. Padding scale: `sm` 16px,
  `md` 20-24px, `lg` 24-32px. **Never nest two `raised` surfaces.**
- **`PassportFact`** (cockpit/company-passport.tsx): a tile inside
  the Passport grid. Rounded-xl border, surface-raised /80 fill,
  16px horizontal padding, 12px vertical, icon + label row, big
  Fraunces value, dim text-faint sub. Five fit on an lg row.

### Inputs / Fields
- **Text input** (used in diagnostic Financials): rounded-md, 1px
  line border, surface-raised fill, 13px Inter text-ink. Focus:
  `border-gold/40 ring-1 ring-gold/30`. The side-by-side AIDA / Your
  override pattern uses a 2-column inner grid inside one
  `<label>`-tied tile.
- **`RatingDots`** (`diagnostic/rating-dots.tsx`): 5 circular
  buttons, 32×32px, mono 11px 600 number inside. Selected state:
  purple fill, white number, 14% purple glow. Inactive: line
  border, transparent fill.
- **`Segmented`** (`vip-ui/segmented.tsx`): pill tab bar. Active
  tab: surface-raised fill + ambient shadow + text-ink. Inactive:
  text-faint, hover text-dim. Overflow-scroll on mobile, no
  scrollbar.

### Navigation
- **`HomeLink`** (`chrome/home-link.tsx`): fixed top-left on
  marketing + auth + infographic; inline in the app header.
  Always points to `/`. Gold-gradient 20px tile + mono "VIP".
- **App header** (`app/(app)/layout.tsx`): single-row bar, line
  border bottom, surface-raised /85 + backdrop blur. HomeLink +
  Companies link on the left; "How it works" + "How scores are
  calculated" on the right.

### Signature: ValueBridge
The signature component
(`web/components/cockpit/value-bridge.tsx`). Five stones (EBITDA,
Sector multiple, SQF, GF, Enterprise value) joined by multiply
glyphs that read as the formula `V = EBITDA × M × SQF × GF`. The
result stone uses gold border + 8% gold fill so it terminates the
math visually. Each stone carries a `SourceBadge` so the founder
sees, at a glance, which inputs came from AIDA, which they
overrode, and which the engine computed. On mobile + tablet the
stones flow into a 2×2 grid with the result spanning both columns.

## 6. Do's and Don'ts

### Do:
- **Do** use one `Surface` per panel and the `tinted` tone for any
  inner contrast layer.
- **Do** put every figure in JetBrains Mono and pair it with a
  `SourceBadge` (AIDA / You / Computed / Proxy) plus an
  `InfoButton`.
- **Do** keep Cockpit Gold under 10% of any screen so the
  enterprise-value tile reads as the answer.
- **Do** use serif Fraunces on value statements and section titles;
  use sans Inter for body; use mono JetBrains for any measurement.
- **Do** test contrast: body text against `--bg-1` (#ffffff) must
  hit ≥4.5:1, large text ≥3:1; `--text-dim` (#565a66) is the floor
  for body copy.
- **Do** ship every animation with a `prefers-reduced-motion`
  fallback (`useReveal` already respects this; new motion must
  too).

### Don't:
- **Don't** nest two `raised` surfaces. If you need a sub-panel,
  switch the inner one to `tinted` or to no container at all.
- **Don't** use cream / sand / paper / parchment / linen / ivory
  for the body background. That's the 2026 AI default; VIP uses
  cool off-white tinted toward gold.
- **Don't** add purple-and-blue gradient hero strips, glow halos,
  bokeh blobs, particle backgrounds, or "AI-powered" copy. PRODUCT.md's
  anti-references list them by name; the visual spec enforces them.
- **Don't** use Lenis smooth scroll, GSAP scroll-triggered
  timelines, side-nav dots, or any other cinematic-mode pattern
  inside the product surfaces. Motion in the cockpit is
  informative only.
- **Don't** put a tiny uppercase tracked eyebrow above every
  section. The cockpit has four named pillars; that's the entire
  eyebrow budget per page.
- **Don't** use `border-left` / `border-right` greater than 1px as
  a coloured stripe accent. Use a full border, background tint, or
  leading number / icon.
- **Don't** use `background-clip: text` with a gradient for
  decoration. Single solid colour, emphasis via weight.
- **Don't** use colour as the only carrier of meaning. The risk
  badge pairs colour with text; the capital bars pair colour with
  bar length; the `SourceBadge` pairs colour with an icon.
- **Don't** use marketing buzzwords (`streamline`, `empower`,
  `supercharge`, `seamless`, `enterprise-grade`,
  `AI-powered`). Pick a specific noun and a specific verb.
