# VIP — Web (Next.js 14)

The production Next.js codebase for **VIP — Value Intelligence Platform**.

> **Current state:** Phase 02 complete — the full cinematic marketing surface is ported from `index.html` to React, with Lenis smooth scroll and GSAP-driven scene animations. Next up is Phase 03 (Supabase + ingestion).

## Run it

```bash
cd web
npm install
npm run dev          # http://localhost:3000
```

When the dev server is up, open <http://localhost:3000>. You should land on the cinematic home page — Hero with word-by-word reveal, then Problem, Capabilities, Capitals (with animated weight bars), Formula (variables pop in sequence), Input Engine (questionnaire dots animate into position), Engines (connecting line draws), Dashboard (radar polygon morphs from center, KPIs count up, frame tilts with the mouse), Architecture, and Closing.

## What changed in Phase 02

| Added in Phase 02 | Where |
| --- | --- |
| Smooth-scroll engine (Lenis) + GSAP/ScrollTrigger bridge | [`components/providers/marketing-providers.tsx`](components/providers/marketing-providers.tsx) |
| Particle field background | [`components/background/particle-field.tsx`](components/background/particle-field.tsx) |
| 10 cinematic scene components | [`components/marketing/scenes/`](components/marketing/scenes) |
| Reusable section-header pattern | [`components/marketing/scene-header.tsx`](components/marketing/scene-header.tsx) |
| Shared animation helpers (count-up, ease, start tokens) | [`lib/animation.ts`](lib/animation.ts) |

New runtime deps: **`gsap@3.12.5`** and **`lenis@1.1.20`**. Re-run `npm install` after pulling.

## Folder layout

```
web/
├── app/
│   ├── layout.tsx                    ← root layout · fonts · chrome
│   ├── globals.css                   ← design tokens + base + components
│   └── (marketing)/
│       ├── layout.tsx                ← Lenis + GSAP providers + particles
│       └── page.tsx                  ← 10 scenes composed
├── components/
│   ├── background/
│   │   ├── bg-grid.tsx               ← masked grid
│   │   ├── bg-glow.tsx               ← mouse-reactive glows
│   │   └── particle-field.tsx        ← drifting particle canvas
│   ├── chrome/
│   │   ├── scroll-progress.tsx       ← gold progress bar
│   │   ├── top-brand.tsx
│   │   ├── top-meta.tsx
│   │   └── side-nav.tsx              ← floating dots · IntersectionObserver scroll-spy
│   ├── marketing/
│   │   ├── scene-header.tsx          ← eyebrow + serif headline + lead pattern
│   │   └── scenes/
│   │       ├── hero.tsx              ← word-reveal · count-up stats · parallax
│   │       ├── problem.tsx           ← 3 glass cards with icons
│   │       ├── capabilities.tsx      ← 5 numbered cards
│   │       ├── capitals.tsx          ← 4 cards, animated weight bars, color identity
│   │       ├── formula.tsx           ← V = … · variable hovers · Value Gap callout
│   │       ├── input-engine.tsx      ← 6 1–5 dot rows + quant + ctx lists
│   │       ├── engines.tsx           ← 5 cards with drawn connector line
│   │       ├── dashboard.tsx         ← KPIs · 4-capital radar morph · Top-3 actions · mouse tilt
│   │       ├── architecture.tsx      ← Sources → Supabase → Dashboard with flow arrows
│   │       └── closing.tsx           ← serif headline + audience tags
│   └── providers/
│       └── marketing-providers.tsx   ← Lenis init + GSAP/ScrollTrigger bridge
├── lib/
│   ├── animation.ts                  ← animateCount · REVEAL_EASE · REVEAL_START
│   ├── cn.ts                         ← clsx + tailwind-merge
│   └── nav.ts                        ← scene → side-nav-dot map
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── package.json
```

## Architecture notes

**Why two layout files.** The root layout (`app/layout.tsx`) hosts the persistent chrome (top brand, side nav, scroll progress) and the cheap fixed-z-0 background (grid + glow). The marketing route group has its *own* layout that adds the expensive client-only stuff (Lenis, GSAP registration, particle canvas) — so the future authenticated `/dashboard` doesn't pay for momentum scroll on a tall data view.

**Animation pattern.** Every scene is a `'use client'` component, owns a `useRef` on its root, and runs `gsap.context(() => { ... }, rootRef)` inside `useLayoutEffect`. The context is reverted on unmount, so all ScrollTriggers and tweens for that scene clean up automatically. No global timeline orchestrator — scenes are independent and reorderable.

**ScrollTrigger + Lenis.** `MarketingProviders` bridges Lenis into GSAP's ticker and forwards `lenis.scroll` into `ScrollTrigger.update`, so triggers stay accurate during smooth-scroll inertia.

**Design tokens.** All colors live in `globals.css` as RGB triples — that's why Tailwind utilities like `bg-gold/30` and `text-cyan/80` work. Tailwind config maps every token to a class via `rgb(var(--gold) / <alpha-value>)`.

**Strict TS.** `noUncheckedIndexedAccess` is on. Most array accesses use `.map`/`.forEach` to dodge it; the radar morph and a few others use non-null assertions where the index is provably safe.

## Scripts

| Command            | What it does                              |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | Dev server on `:3000`, hot reload         |
| `npm run build`    | Production build                          |
| `npm run start`    | Serve the built bundle                    |
| `npm run lint`     | ESLint                                    |
| `npm run type-check` | `tsc --noEmit` strict type check        |

## Acceptance criteria (Phase 02)

- [x] All 10 scenes from the cinematic single-file site live as React components
- [x] Lenis smooth scroll active across the marketing route
- [x] GSAP scroll triggers wired for every scene (entrance reveals, count-ups, radar morph, drawn line)
- [x] Particle canvas + chrome inherited from Phase 01 still work
- [x] Reduced-motion guard respected throughout
- [x] All `@/*` imports resolve

## Cleanup

The Phase 01 placeholder files in [`components/sections/`](components/sections) are now stubs marked `@deprecated`. Safe to remove:

```bash
rm -rf web/components/sections
```

## Next — Phase 03

Stand up Supabase. Five calibration tables + five user-facing tables, RLS policies, Python ingestion script that loads the 14,999-SME AIDA dataset, and `supabase gen types` wired into the build. Acceptance: `SELECT count(*) FROM financial_capital` returns 14,999. See [`../docs/VIP_Build_Plan.pdf`](../docs/VIP_Build_Plan.pdf) section 14 / Phase 03 for the full brief.
