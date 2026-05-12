'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SceneHeader } from '@/components/marketing/scene-header';
import { useReveal } from '@/lib/use-reveal';
import { animateCount, REVEAL_EASE } from '@/lib/animation';

// Radar target positions, top → right → bottom → left
const RADAR_TARGETS: readonly { id: string; cx: number; cy: number }[] = [
  { id: 'rpt1', cx: 160, cy: 92  }, // Financial · top    · 68
  { id: 'rpt2', cx: 214, cy: 160 }, // Tech · right       · 54
  { id: 'rpt3', cx: 160, cy: 231 }, // Human & Org · bot  · 71
  { id: 'rpt4', cx: 105, cy: 160 }, // Relational · left  · 55
];

const ACTIONS = [
  { n: 1, main: <>Reduce <strong>client concentration</strong> from 60% top-3 to &lt;40%.</>, rov: 'SQF +0.12 · 24mo', impact: '+12% V' },
  { n: 2, main: <>Introduce <strong>recurring revenue</strong> via subscription or multi-year contracts.</>, rov: 'GF +0.15 · 18mo',  impact: '+9% V'  },
  { n: 3, main: <>Strengthen <strong>middle management</strong> — reduce founder dependency.</>, rov: 'Transferability low → high', impact: '+7% V' },
];

/**
 * Marketing dashboard preview — a still-frame of the real product surface.
 *
 * Keeps two informative animations (one-shot, on viewport entry):
 *   · KPI count-ups
 *   · Radar polygon morph from center → target
 *
 * Drops: 3D mouse-tilt parallax, GSAP entrance timelines for the cards.
 */
export function Dashboard() {
  const rootRef = useReveal<HTMLElement>();
  const animationsFired = useRef(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !animationsFired.current) {
          animationsFired.current = true;
          fireDashboardAnimations(el);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootRef]);

  return (
    <section
      ref={rootRef}
      id="dashboard"
      className="reveal relative mx-auto max-w-[1240px] px-8 py-36"
    >
      <SceneHeader
        eyebrow="Platform output"
        title="The decision, on one page."
        accent="on one page."
        lead="Every metric the platform produces collapses into one screen: what the company is worth, what's holding it back, and which three actions move the needle."
      />

      <div
        className="relative rounded-[20px] border border-line-2 bg-gradient-to-b from-bg-2 to-bg-1 p-1"
        style={{
          boxShadow:
            '0 40px 100px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2 border-b border-line px-[18px] py-3.5">
          <span className="block h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="block h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="block h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <div className="ml-4 flex-1 rounded-lg border border-line bg-black/40 px-3.5 py-1 font-mono text-[11px] text-text-faint">
            <span className="text-green">https://</span>vip.app/dashboard/acme-industrie-srl
          </div>
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
            <div className="flex items-center gap-4">
              <div
                className="flex h-[52px] w-[52px] items-center justify-center rounded-[13px] bg-gradient-to-br from-cyan to-blue font-serif text-[18px] font-semibold text-white"
                style={{ boxShadow: '0 6px 20px rgba(6, 182, 212, 0.35)' }}
              >
                AI
              </div>
              <div>
                <div className="font-serif text-[22px] font-medium tracking-tight">
                  ACME INDUSTRIE S.R.L.
                </div>
                <div className="mt-1 font-mono text-[12px] text-text-dim">
                  Manufacturing · Lombardia · Lifecycle: Maturity
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gold/30 bg-gold/[0.12] px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-eyebrow text-gold">
              ● Diagnostic complete
            </div>
          </div>

          {/* KPIs */}
          <div className="mb-3.5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi tone="gold"  label="Estimated Value" target={4.2} decimals={1} prefix="€" suffix="M" sub="Range: €3.8M – €4.7M" />
            <Kpi tone="green" label="Value Gap"       target={38}             prefix="+" suffix="%" sub="Optimised potential" />
            <KpiCompound tone="cyan" label="Quality Score" target={67} suffix="/100" sub="Above-average structure" />
            <KpiText tone="amber" label="Risk Index" main="MEDIUM" sub="Client concentration flag" />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1.3fr]">
            <RadarPanel />
            <ActionsPanel />
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// One-shot dashboard animations — fired when the section first enters view.
// =============================================================================
function fireDashboardAnimations(root: HTMLElement) {
  // KPI count-up
  root.querySelectorAll<HTMLElement>('[data-count-target]').forEach((el) => {
    const target = Number(el.dataset.countTarget);
    const decimals = Number(el.dataset.decimals ?? 0);
    const prefix = el.dataset.countPrefix ?? '';
    const suffix = el.dataset.countSuffix ?? '';
    animateCount(el, target, { decimals, prefix, suffix });
  });

  // Radar polygon morph (center → target points)
  const poly = root.querySelector<SVGPolygonElement>('#radarPoly');
  if (poly) {
    const obj = { p: 0 };
    gsap.to(obj, {
      p: 1,
      duration: 1.2,
      ease: REVEAL_EASE,
      onUpdate: () => {
        const t = obj.p;
        const pts = RADAR_TARGETS.map((tgt) => {
          const x = 160 + (tgt.cx - 160) * t;
          const y = 160 + (tgt.cy - 160) * t;
          return `${x},${y}`;
        }).join(' ');
        poly.setAttribute('points', pts);
      },
    });
  }
  RADAR_TARGETS.forEach((t) => {
    const el = root.querySelector(`#${t.id}`);
    if (el) gsap.to(el, { attr: { cx: t.cx, cy: t.cy }, duration: 1.2, ease: REVEAL_EASE });
  });
}

// =============================================================================
// KPI sub-components
// =============================================================================

type Tone = 'gold' | 'green' | 'cyan' | 'amber';
const TONE_CLASS: Record<Tone, string> = { gold: 'text-gold', green: 'text-green', cyan: 'text-cyan', amber: 'text-amber' };
const TONE_RGB:   Record<Tone, string> = { gold: 'var(--gold)', green: 'var(--green)', cyan: 'var(--cyan)', amber: 'var(--amber)' };

function KpiShell({ tone, label, children }: { tone: Tone; label: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-line bg-black/30 p-5 transition-all duration-300 hover:bg-black/50">
      <span aria-hidden className="absolute left-0 top-0 h-full w-[3px]" style={{ background: `rgb(${TONE_RGB[tone]})`, opacity: 0.6 }} />
      <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
        {label}
      </div>
      {children}
    </div>
  );
}

function Kpi({
  tone, label, target, decimals = 0, prefix = '', suffix = '', sub,
}: { tone: Tone; label: string; target: number; decimals?: number; prefix?: string; suffix?: string; sub: string }) {
  return (
    <KpiShell tone={tone} label={label}>
      <div
        className={`font-mono text-[28px] font-bold leading-none tracking-tight ${TONE_CLASS[tone]}`}
        data-count-target={target}
        data-decimals={decimals}
        data-count-prefix={prefix}
        data-count-suffix={suffix}
      >
        {prefix}0{decimals > 0 ? '.0' : ''}{suffix}
      </div>
      <div className="mt-2 font-mono text-[11.5px] text-text-dim">{sub}</div>
    </KpiShell>
  );
}

function KpiCompound({ tone, label, target, suffix, sub }: { tone: Tone; label: string; target: number; suffix: string; sub: string }) {
  return (
    <KpiShell tone={tone} label={label}>
      <div className={`font-mono text-[28px] font-bold leading-none tracking-tight ${TONE_CLASS[tone]}`}>
        <span data-count-target={target}>0</span>
        <span className="text-[14px] text-text-faint">{suffix}</span>
      </div>
      <div className="mt-2 font-mono text-[11.5px] text-text-dim">{sub}</div>
    </KpiShell>
  );
}

function KpiText({ tone, label, main, sub }: { tone: Tone; label: string; main: string; sub: string }) {
  return (
    <KpiShell tone={tone} label={label}>
      <div className={`font-mono text-[22px] font-bold tracking-[0.05em] ${TONE_CLASS[tone]}`}>{main}</div>
      <div className="mt-2 font-mono text-[11.5px] text-text-dim">{sub}</div>
    </KpiShell>
  );
}

// =============================================================================
// Radar
// =============================================================================
function RadarPanel() {
  return (
    <div className="rounded-[14px] border border-line bg-black/30 p-6">
      <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-eyebrow text-text-faint">
        4-Capital Radar
      </h4>
      <div className="flex items-center justify-center py-1.5">
        <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" className="h-auto w-full max-w-[300px]">
          <polygon points="160,135 185,160 160,185 135,160" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
          <polygon points="160,110 210,160 160,210 110,160" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
          <polygon points="160,85 235,160 160,235 85,160"   fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
          <polygon points="160,60 260,160 160,260 60,160"   fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
          <line x1="160" y1="60" x2="160" y2="260" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
          <line x1="60" y1="160" x2="260" y2="160" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
          <polygon
            id="radarPoly"
            points="160,160 160,160 160,160 160,160"
            fill="rgba(245, 165, 36, 0.15)"
            stroke="rgb(245, 165, 36)"
            strokeWidth={2}
            style={{ filter: 'drop-shadow(0 0 12px rgba(245, 165, 36, 0.4))' }}
          />
          {RADAR_TARGETS.map((t) => (
            <circle key={t.id} id={t.id} cx={160} cy={160} r={5}
              fill="rgb(245, 165, 36)" stroke="rgb(var(--bg))" strokeWidth={2}
              style={{ filter: 'drop-shadow(0 0 6px rgba(245, 165, 36, 0.6))' }}
            />
          ))}
          <text x="160" y="44"  textAnchor="middle" fontSize={11} fontWeight={600} fill="rgb(var(--text-dim))" fontFamily="Inter, sans-serif">Financial</text>
          <text x="160" y="28"  textAnchor="middle" fontSize={11} fontWeight={700} fill="rgb(var(--gold))" fontFamily="JetBrains Mono, monospace">68</text>
          <text x="278" y="163" textAnchor="start"  fontSize={11} fontWeight={600} fill="rgb(var(--text-dim))" fontFamily="Inter, sans-serif">Tech</text>
          <text x="278" y="180" textAnchor="start"  fontSize={11} fontWeight={700} fill="rgb(var(--gold))" fontFamily="JetBrains Mono, monospace">54</text>
          <text x="160" y="282" textAnchor="middle" fontSize={11} fontWeight={600} fill="rgb(var(--text-dim))" fontFamily="Inter, sans-serif">Human &amp; Org</text>
          <text x="160" y="298" textAnchor="middle" fontSize={11} fontWeight={700} fill="rgb(var(--gold))" fontFamily="JetBrains Mono, monospace">71</text>
          <text x="42"  y="163" textAnchor="end"    fontSize={11} fontWeight={600} fill="rgb(var(--text-dim))" fontFamily="Inter, sans-serif">Relational</text>
          <text x="42"  y="180" textAnchor="end"    fontSize={11} fontWeight={700} fill="rgb(var(--gold))" fontFamily="JetBrains Mono, monospace">55</text>
        </svg>
      </div>
    </div>
  );
}

// =============================================================================
// Actions
// =============================================================================
function ActionsPanel() {
  return (
    <div className="rounded-[14px] border border-line bg-black/30 p-6">
      <h4 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-eyebrow text-text-faint">
        Top 3 Priority Actions · ranked by ROV
      </h4>
      {ACTIONS.map((a, i) => (
        <div
          key={a.n}
          className={`flex gap-3.5 py-3.5 text-[13px] leading-snug ${
            i < ACTIONS.length - 1 ? 'border-b border-line-faint' : 'pb-0'
          } ${i === 0 ? 'pt-0' : ''}`}
        >
          <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.15] font-mono text-[12px] font-bold text-gold">
            {a.n}
          </div>
          <div className="flex-1 text-text-dim">
            <span className="[&_strong]:font-semibold [&_strong]:text-text">{a.main}</span>
            <br />
            <span className="mt-1.5 inline-block rounded-md bg-green/[0.12] px-2 py-0.5 font-mono text-[10.5px] font-bold tracking-[0.04em] text-green">
              {a.rov}
            </span>
          </div>
          <div
            className="shrink-0 self-center font-mono text-[16px] font-bold text-green"
            style={{ textShadow: '0 0 12px rgba(34, 197, 94, 0.4)' }}
          >
            {a.impact}
          </div>
        </div>
      ))}
    </div>
  );
}
