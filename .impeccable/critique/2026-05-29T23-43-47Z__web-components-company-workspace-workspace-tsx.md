---
target: web/components/company-workspace/workspace.tsx
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-05-29T23-43-47Z
slug: web-components-company-workspace-workspace-tsx
---
# Cockpit critique · web/components/company-workspace/workspace.tsx

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No skeleton during workspace load; Reset error inline only |
| 2 | Match System / Real World | 3 | SQF / GF acronyms inline before InfoButton click |
| 3 | User Control and Freedom | 3 | No draft persistence; mid-diagnostic refresh wipes everything |
| 4 | Consistency and Standards | 3 | Spacing varies between cockpit (gap-5) + financials (gap-3) panels |
| 5 | Error Prevention | 2 | Multi-tab race; Reset has confirm but no undo |
| 6 | Recognition Rather Than Recall | 3 | InfoButton + SourceBadge + always-visible Passport |
| 7 | Flexibility and Efficiency | 2 | Zero keyboard shortcuts. No Cmd-K, no Cmd-Enter submit |
| 8 | Aesthetic and Minimalist | 3 | QuestionFocus "Not relevant" still competes with title |
| 9 | Error Recovery | 2 | Errors named, not solved (no retry CTA on save failure) |
| 10 | Help and Documentation | 3 | InfoButton carries; no onboarding tour, no keyboard help |
| **Total** | | **27/40** | **Acceptable; significant improvements** |

## Anti-Patterns Verdict
LLM: NOT slop. SourceBadge + InfoButton is the distinctive ownable signature.
Detector: clean ([]) over cockpit/, company-workspace/, diagnostic/, vip-ui/.
Browser overlays: unavailable (no Chrome MCP).

## What's Working
1. Provenance system (SourceBadge + InfoButton) — biggest moat.
2. Cockpit composition after recent polish — KPI → ValueBridge → Constellation → StrategyBoard reads as one argument.
3. Diagnostic 7-step shape — Financials → focus cards → Review.

## Priority Issues
- [P1] Diagnostic state loss on tab close/refresh. RHF memory only. Audience = single-session, possibly interrupted founders. Add localStorage draft restore keyed by tax_code. → /impeccable harden
- [P1] No keyboard story. No Cmd-K, no Cmd-Enter, no / focus. ProgressRail pills not focusable. Conflicts with "Strategist's Cockpit" positioning. → /impeccable harden
- [P2] Reset is one mis-click from data loss. Soft-delete with 5s undo strip. → /impeccable harden
- [P2] SQF/GF bare acronyms before InfoButton click. First occurrence per page should spell full name. → /impeccable clarify
- [P2] Mid-diagnostic has no live capital preview. Add slim right-rail mini-radar that updates per Q. → /impeccable craft

## Persona Red Flags
Alex (Power User): No Cmd-K palette; no keyboard submit; ProgressRail not Tab+Arrow navigable; no bulk-mark on Qs.
Sam (Accessibility): Capital radar SVG has no title/desc; SourceBadge labels lack aria-label context; RatingDots no role=radiogroup wrapper.
Casey (Mobile): RatingDots 32x32 below 44x44 minimum; ProgressRail scrolls without overflow indicator; Pre-fill AIDA tap target too close to Toggle.

## Cognitive Load
2/8 fails (One-thing-at-a-time soft fail given dense register). Low overall.

## Minor Observations
- SavedStrip 7s auto-dismiss has no progress indicator.
- "X / Y" step counter alignment slightly off.
- Run vs Re-run diagnostic use same icon.
- /companies quick-try chips lack helper text.
- Empty-state CTA "Bring this company to life" borders aspirational.

## Questions to Consider
- Mid-diagnostic live mini-radar — would it change pacing?
- Cmd-K palette necessary for 1-5 companies a founder cares about?
- Remove Reset entirely (Re-run writes new submission row)?
- Risk Index needs inline "what to do about it"?
- Rename SQF/GF to "Quality factor / Growth factor" everywhere?
