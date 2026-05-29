# Product

## Register

product

## Users

Italian SME entrepreneurs — owners, founders, and management of the ~14,999
small-to-mid manufacturing companies in the AIDA / Bureau van Dijk
calibration set. Typical context: a single-session, founder-driven
sanity check on enterprise value. They are commercially literate but
not analysts; they read EBITDA but not Damodaran. Job to be done: in
one sitting, see what their company is worth, what drives that
number, and the three highest-ROV moves to close the value gap.
Secondary users: M&A advisors and acquisition scouts running the
same diagnostic against a target.

## Product Purpose

VIP turns 19 honest qualitative answers plus the public AIDA snapshot
into a defensible strategic enterprise valuation. The headline number
is `V = EBITDA × M_sector × SQF × GF`, calibrated against the AIDA
cohort. Success looks like the founder closing the cockpit able to
say out loud: "my company is worth X, here is the value gap, here
are the three moves." Every figure on the page must trace back to
either the AIDA snapshot, an entrepreneur override, or the engine —
no black boxes, no opaque dashboards.

## Brand Personality

Analytical · dense · transparent. The voice is a senior strategist
showing you their work, not a SaaS pitch. Cockpit feel:
business-app density without the SaaS clutter. Every claim is
sourced via the SourceBadge; every number is auditable via the
InfoButton popover. No marketing buzzwords — say what the product
literally does.

## Anti-references

- Generic SaaS dashboards with purple-and-blue gradient hero strips,
  identical icon-grid features, and Linear/Notion-derivative chrome.
- AI / crypto landing pages: glow, particles, bokeh blobs, animated
  mesh backgrounds, "AI-powered" copy, mystical chips.
- The 2026 AI-default warm-neutral palette (cream / sand / paper /
  parchment body backgrounds at OKLCH L 0.84–0.97, C < 0.06). VIP
  uses an off-white tinted toward the brand's own gold rather than
  defaulting to warm beige.
- Cinematic scrollytelling inside the product surface (Lenis smooth
  scroll, GSAP scroll-triggered timelines, side-nav dots). The
  marketing scenes use calm `useReveal`; the cockpit uses motion only
  to communicate (number count-ups, radar polygon morph, capital
  weight bars).

## Design Principles

1. **Source every number.** Every figure carries a `SourceBadge`
   (AIDA · You · Computed · Proxy) plus an info button that shows
   the literal calculation for *this* company.
2. **No card-inside-card.** Use `Surface` once per panel; use
   `tinted` for the inner contrast layer; never nest two raised
   surfaces.
3. **Density without clutter.** Compact rows, tight type scale,
   eyebrows used sparingly. Reach for `flex-wrap` before grid;
   reach for grid before extra borders.
4. **Calm motion only.** `useReveal` for fade-up on scroll;
   `animateCount` for headline KPIs; radar polygon morph. Everything
   else is informative or it doesn't ship. Respect
   `prefers-reduced-motion`.
5. **Founder-readable.** Cap line length 65–75ch, use serif Fraunces
   for value statements, mono JetBrains for sourced metrics, sans
   Inter for body. Hierarchy through scale + weight, never colour
   alone.

## Accessibility & Inclusion

WCAG 2.2 AA across every surface. Body text ≥4.5:1 contrast against
its background; large text ≥3:1. Every interactive element has a
visible focus ring. The `InfoButton` opens via click + Enter + Space
and closes on Escape + outside-click. `prefers-reduced-motion`
collapses the radar morph + count-ups to instant transitions. Colour
is never the only carrier of meaning (risk badge pairs colour with
text, capital bars pair colour with bar length).
