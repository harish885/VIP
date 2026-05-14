// web/app/infographic/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from 'recharts';
import {
  Search, Building2, FileText, Brain, Layers, Gauge, Target,
  Sparkles, Crown, Settings2, TrendingUp, AlertTriangle, ArrowRight,
  Database, MessageSquareQuote, Network, BarChart3, Beaker,
  Cpu, CircleDollarSign, Users, Workflow, Compass, Factory, ChartScatter,
} from 'lucide-react';

/* ===========================================================================
   MOCK DATA — ACME INDUSTRIE S.R.L.
=========================================================================== */

const COMPANY = {
  name: 'ACME INDUSTRIE S.R.L.',
  initials: 'AI',
  sector: 'Manufacturing',
  nace: '282',
  province: 'Lombardia',
  peer_group: '282 — Medium · North-Italy',
  lifecycle: 'Maturity',
};

const AIDA = [
  { icon: CircleDollarSign, label: 'Revenue · last 3y', value: '€6.2M → €7.1M → €8.4M' },
  { icon: TrendingUp,       label: 'EBITDA',            value: '€750K · 8.9% margin' },
  { icon: Users,            label: 'Employees',         value: '54 FTE' },
  { icon: Factory,          label: 'Sector',            value: 'NACE 282 · Machinery' },
  { icon: Beaker,           label: 'R&D / revenue',     value: '1.2%' },
  { icon: Compass,          label: 'Peer group',        value: '~640 companies' },
];

const DIAGNOSTIC = [
  { icon: Cpu,     label: 'Digital maturity',     value: '2 / 5' },
  { icon: Users,   label: 'Founder dependency',   value: '2 / 5' },
  { icon: Network, label: 'Partnerships',         value: '3 / 5' },
  { icon: Target,  label: 'Client portfolio',     value: '2 / 5' },
  { icon: Workflow, label: 'Scalability',         value: '4 / 5' },
  { icon: BarChart3, label: 'Growth quality',     value: '3 / 5' },
];

const SIGNALS = [
  { raw: 'Revenue 3y series',      arrow: '→', signal: 'Revenue CAGR',           value: '+16.4%' },
  { raw: 'EBITDA + revenue',       arrow: '→', signal: 'Margin quality',         value: '8.9% · p52' },
  { raw: 'Client portfolio (Q9)',  arrow: '→', signal: 'Concentration resilience',value: '40 · p45' },
  { raw: 'Digital + R&D inputs',   arrow: '→', signal: 'Tech investment signal', value: '38 · p54' },
  { raw: 'Founder + mgmt (Q5/Q6)', arrow: '→', signal: 'Founder independence',   value: '54 · p61' },
  { raw: 'Scalability + lifecycle',arrow: '→', signal: 'Growth factor inputs',   value: '1.07× base' },
];

const PERCENTILES = [
  { label: 'EBITDA margin',           p: 65, color: '#22c55e' },
  { label: 'Revenue CAGR',            p: 84, color: '#06b6d4' },
  { label: 'Tech investment',         p: 54, color: '#a855f7' },
  { label: 'Concentration resilience',p: 45, color: '#f59e0b' },
  { label: 'Mgmt depth',              p: 58, color: '#f43f5e' },
];

const PEER_CLOUD = Array.from({ length: 64 }, (_, i) => ({
  x: 20 + Math.random() * 70,
  y: 15 + Math.random() * 70,
  z: 60 + Math.random() * 40,
  highlight: false,
}));
PEER_CLOUD.push({ x: 68, y: 71, z: 280, highlight: true }); // ACME

const CAPITALS = [
  { key: 'fin',   name: 'Financial',     score: 68, weight: 35, color: '#3b82f6',
    signals: ['EBITDA margin · p65', 'Revenue CAGR · p84', 'Concentration · p45', 'Leverage proxy · p58'] },
  { key: 'tech',  name: 'Technological', score: 54, weight: 20, color: '#a855f7',
    signals: ['Digital maturity · 2/5', 'Tech investment · p54', 'Proprietary tech · 3/5'] },
  { key: 'human', name: 'Human & Org',   score: 71, weight: 25, color: '#f97316',
    signals: ['Founder indep. · 54', 'Mgmt depth · 58', 'Process maturity · 3/5', 'Transferability · 2/5'] },
  { key: 'rel',   name: 'Relational',    score: 55, weight: 20, color: '#22c55e',
    signals: ['Client portfolio · 2/5', 'Partnerships · 3/5', 'Reputation · 4/5', 'Network · 3/5'] },
];

const CANDIDATE_ACTIONS = [
  { title: 'Reduce client concentration',     uplift: 12, effort: 3, time: 24, capital: 'Relational',  rov: 0.083, top: 1 },
  { title: 'Introduce recurring revenue',     uplift: 9,  effort: 3, time: 18, capital: 'Relational',  rov: 0.075, top: 2 },
  { title: 'Strengthen middle management',    uplift: 7,  effort: 2, time: 36, capital: 'Human & Org', rov: 0.058, top: 3 },
  { title: 'Capitalise R&D investment',       uplift: 6,  effort: 4, time: 12, capital: 'Technological', rov: 0.042 },
  { title: 'Adopt ERP / automation',          uplift: 5,  effort: 4, time: 18, capital: 'Technological', rov: 0.038 },
  { title: 'Formalise core processes',        uplift: 4,  effort: 2, time: 12, capital: 'Human & Org',   rov: 0.036 },
  { title: 'Build strategic partnerships',    uplift: 4,  effort: 3, time: 24, capital: 'Relational',    rov: 0.028 },
  { title: 'Diversify into adjacent products',uplift: 8,  effort: 5, time: 36, capital: 'Financial',     rov: 0.026 },
  { title: 'Export market expansion',         uplift: 6,  effort: 4, time: 30, capital: 'Relational',    rov: 0.024 },
];

const BASE_V        = 4.2;   // €M
const BASE_POTENTIAL = 5.8;  // €M
const BASE_SQF      = 1.05;
const BASE_GF       = 1.07;
const BASE_RISK     = 'MEDIUM';

const SCENARIO_DELTAS = {
  concentration: { dSqf: 0.05, dGf: 0.00, capitalBoost: { fin: 6, rel: 4 }, riskShift: -1 },
  recurring:     { dSqf: 0.02, dGf: 0.07, capitalBoost: { fin: 3, rel: 5 }, riskShift: -1 },
  digital:       { dSqf: 0.04, dGf: 0.02, capitalBoost: { tech: 12 },       riskShift: 0  },
  management:    { dSqf: 0.06, dGf: 0.01, capitalBoost: { human: 10 },      riskShift: -1 },
};

/* ===========================================================================
   UTILITIES
=========================================================================== */

function useCountUp(target: number, duration = 1.6, decimals = 0) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setV(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  return { ref, value: decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString() };
}

function Counter({
  to, prefix = '', suffix = '', decimals = 0, className = '',
}: { to: number; prefix?: string; suffix?: string; decimals?: number; className?: string }) {
  const { ref, value } = useCountUp(to, 1.5, decimals);
  return (
    <span ref={ref} className={className}>
      {prefix}{value}{suffix}
    </span>
  );
}

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

function Section({
  children, className = '', id,
}: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section
      id={id}
      className={`relative mx-auto max-w-[1320px] px-6 py-28 md:py-36 ${className}`}
    >
      {children}
    </section>
  );
}

function Eyebrow({ children, color = 'text-gold' }: { children: React.ReactNode; color?: string }) {
  return (
    <div className={`mb-4 inline-block rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] ${color} backdrop-blur-sm`}>
      {children}
    </div>
  );
}

function H2({ children, accent }: { children: string; accent?: string }) {
  if (accent && children.includes(accent)) {
    const [before, ...rest] = children.split(accent);
    const after = rest.join(accent);
    return (
      <h2
        className="font-serif font-normal leading-[1.05] tracking-tight"
        style={{ fontSize: 'clamp(2rem, 4.5vw, 3.75rem)', letterSpacing: '-0.025em' }}
      >
        <span className="text-white/90">{before}</span>
        <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200 bg-clip-text italic text-transparent">
          {accent}
        </span>
        <span className="text-white/90">{after}</span>
      </h2>
    );
  }
  return (
    <h2 className="font-serif font-normal leading-[1.05] tracking-tight text-white/90" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.75rem)' }}>
      {children}
    </h2>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 max-w-[680px] text-[15px] leading-relaxed text-white/55">
      {children}
    </p>
  );
}

/* ===========================================================================
   SECTION 1 — CINEMATIC HERO
=========================================================================== */

function Section1Hero() {
  const ORBITERS = [
    { icon: Database,        label: 'Company facts',  color: 'from-cyan-400 to-cyan-600',    angle: 0,   radius: 220 },
    { icon: BarChart3,       label: 'Peer benchmark', color: 'from-emerald-400 to-teal-600', angle: 90,  radius: 220 },
    { icon: Layers,          label: 'Capital scores', color: 'from-amber-300 to-amber-500',  angle: 180, radius: 220 },
    { icon: Target,          label: 'Value actions',  color: 'from-fuchsia-400 to-violet-600', angle: 270, radius: 220 },
  ];

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245,165,36,0.12), transparent 60%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(168,85,247,0.08), transparent 60%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/[0.06] px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300 backdrop-blur"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400 shadow-[0_0_10px_rgb(245,165,36)]" />
        VIP · Value Intelligence Platform
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="font-serif font-normal leading-[0.98] text-white/90"
        style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', letterSpacing: '-0.04em' }}
      >
        From SME data to<br />
        <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-100 bg-clip-text italic text-transparent">
          strategic value creation.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-6 max-w-[640px] text-[16px] leading-relaxed text-white/55"
      >
        A decision assistant that turns balance-sheet evidence and entrepreneur insight
        into a peer-relative valuation, four capital scores, and a ranked action plan.
      </motion.p>

      {/* Orbital diagram */}
      <div className="relative my-20 h-[520px] w-[520px] max-w-full">
        {/* Concentric guides */}
        {[140, 200, 260].map((r) => (
          <div key={r}
            className="absolute left-1/2 top-1/2 rounded-full border border-white/[0.06]"
            style={{ width: r * 2, height: r * 2, transform: 'translate(-50%, -50%)' }}
          />
        ))}

        {/* Slow rotating ring */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        >
          {ORBITERS.map((o, i) => {
            const rad = (o.angle * Math.PI) / 180;
            const x = Math.cos(rad) * o.radius;
            const y = Math.sin(rad) * o.radius;
            return (
              <motion.div
                key={o.label}
                className="absolute left-1/2 top-1/2"
                style={{ x, y }}
                animate={{ rotate: -360 }}
                transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
              >
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <div className={`flex flex-col items-center gap-2`}>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br ${o.color} shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]`}>
                      <o.icon size={22} strokeWidth={1.75} className="text-white" />
                    </div>
                    <span className="whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                      {o.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Center orb */}
        <motion.div
          className="absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: 'radial-gradient(circle, rgba(245,165,36,0.35) 0%, rgba(245,165,36,0.05) 60%, transparent 100%)',
            boxShadow: '0 0 80px 20px rgba(245,165,36,0.15)',
          }}
        >
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-amber-300/40 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-[inset_0_0_30px_rgba(245,165,36,0.2)]">
            <span className="bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text font-serif text-[34px] font-medium tracking-tight text-transparent">
              VIP
            </span>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-white/40">
              v1.0
            </span>
          </div>
        </motion.div>

        {/* Floating particles */}
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-amber-300/60"
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: Math.cos((i / 18) * Math.PI * 2) * (180 + (i % 3) * 30),
              y: Math.sin((i / 18) * Math.PI * 2) * (180 + (i % 3) * 30),
              opacity: [0, 0.7, 0],
            }}
            transition={{ duration: 4 + (i % 4), repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-x-12 gap-y-8 md:grid-cols-6">
        {[
          { v: 14999, l: 'SMEs benchmarked' },
          { v: 20,    l: 'Diagnostic Qs' },
          { v: 11,    l: 'Engineered signals' },
          { v: 4,     l: 'Capital pillars' },
          { v: 9,     l: 'Candidate actions' },
          { v: 3,     l: 'Top priorities' },
        ].map(s => (
          <div key={s.l} className="text-center">
            <Counter to={s.v} className="block bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text font-mono text-[28px] font-bold tracking-tight text-transparent md:text-[34px]" />
            <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-16 font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/30">
        ▼ Scroll to explore the model
      </div>
    </section>
  );
}

/* ===========================================================================
   SECTION 2 — JOURNEY MAP
=========================================================================== */

function Section2Journey() {
  const NODES = [
    { icon: Search,        label: 'Company search',     sub: '14,999 AIDA SMEs' },
    { icon: Building2,     label: 'Company dossier',    sub: 'Facts + peer group' },
    { icon: MessageSquareQuote, label: 'Diagnostic',    sub: '20 questions · 1–5' },
    { icon: Cpu,           label: 'Signal engine',      sub: '11 signals derived' },
    { icon: Compass,       label: 'Peer benchmark',     sub: 'Percentile rank' },
    { icon: Layers,        label: '4 Capitals',         sub: 'Weighted aggregate' },
    { icon: Gauge,         label: 'Value equation',     sub: 'V = EBITDA × M × SQF × GF' },
    { icon: Crown,         label: 'Top actions',        sub: 'Ranked by ROV' },
    { icon: Beaker,        label: 'Scenario lab',       sub: 'What-if simulation' },
  ];

  const [hover, setHover] = useState<number | null>(null);

  return (
    <Section>
      <Eyebrow color="text-cyan-300">— The journey —</Eyebrow>
      <H2 accent="value pipeline.">One company. One value pipeline.</H2>
      <Lead>
        Every diagnostic walks this path. Each node produces an inspectable artefact —
        nothing is hidden in a black box.
      </Lead>

      <div className="relative mt-16">
        {/* Connecting path */}
        <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pipeline" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"  stopColor="#06b6d4" stopOpacity="0.6"/>
              <stop offset="50%" stopColor="#f5a524" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6"/>
            </linearGradient>
          </defs>
        </svg>

        <div className="relative grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-9">
          {NODES.map((n, i) => (
            <motion.div
              key={n.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="group relative"
            >
              <div className="relative flex flex-col items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur transition-all hover:-translate-y-1 hover:border-amber-300/40 hover:bg-amber-400/[0.04]">
                <div className="absolute -top-2 left-3 font-mono text-[9px] font-bold tracking-[0.18em] text-amber-300/70">
                  0{i + 1}
                </div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 transition-colors group-hover:border-amber-300/40">
                  <n.icon size={20} strokeWidth={1.5} className="text-white/80 group-hover:text-amber-300" />
                </div>
                <div className="text-center font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-white/90 leading-tight">
                  {n.label}
                </div>
                <div className="mt-1 text-center text-[10.5px] leading-snug text-white/40">
                  {n.sub}
                </div>
              </div>

              {/* Connector line to next node */}
              {i < NODES.length - 1 && (
                <div className="absolute right-[-6px] top-1/2 hidden -translate-y-1/2 lg:block">
                  <motion.div
                    className="h-px w-3 bg-gradient-to-r from-amber-300/60 to-transparent"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  />
                </div>
              )}

              {/* Flowing particle (visible at lg+) */}
              {i < NODES.length - 1 && (
                <motion.div
                  className="absolute right-[-2px] top-1/2 hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-amber-300 lg:block"
                  initial={{ x: -8, opacity: 0 }}
                  animate={{ x: 8, opacity: [0, 1, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.25 }}
                  style={{ boxShadow: '0 0 8px rgb(245,165,36)' }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ===========================================================================
   SECTION 3 — TWO EVIDENCE STREAMS
=========================================================================== */

function Section3EvidenceStreams() {
  return (
    <Section>
      <Eyebrow color="text-cyan-300">— Evidence —</Eyebrow>
      <H2 accent="merge into one signal stream.">Two streams of evidence merge into one signal stream.</H2>
      <Lead>
        Hard facts from the company&apos;s filings, and lived experience from the entrepreneur.
        Neither alone is enough — together they make a profile worth valuing.
      </Lead>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto_1fr]">
        {/* AIDA side */}
        <motion.div
          variants={fadeUp}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/[0.04] to-transparent p-6"
        >
          <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
            Stream A
          </div>
          <h3 className="mb-1 font-serif text-[22px] tracking-tight text-white/90">
            Known from AIDA
          </h3>
          <p className="mb-5 text-[12.5px] text-white/40">
            Filings, classifications, peer cohort
          </p>
          <div className="space-y-2">
            {AIDA.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/30 p-3"
              >
                <item.icon size={16} strokeWidth={1.5} className="shrink-0 text-cyan-300/80" />
                <div className="flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">
                    {item.label}
                  </div>
                  <div className="font-mono text-[13px] text-white/90">{item.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Merge arrows / orb */}
        <div className="hidden flex-col items-center justify-center md:flex">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-amber-400/30 blur-2xl"
            />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-amber-300/30 bg-zinc-950">
              <Sparkles size={22} className="text-amber-300" strokeWidth={1.75} />
            </div>
          </div>
          <div className="mt-4 max-w-[120px] text-center font-mono text-[10px] uppercase tracking-[0.16em] text-amber-300/80">
            Interpretable<br/>company profile
          </div>
        </div>

        {/* Diagnostic side */}
        <motion.div
          variants={fadeUp}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/[0.04] to-transparent p-6"
        >
          <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-300">
            Stream B
          </div>
          <h3 className="mb-1 font-serif text-[22px] tracking-tight text-white/90">
            Revealed by diagnostic
          </h3>
          <p className="mb-5 text-[12.5px] text-white/40">
            20 questions · 1–5 Likert · self-assessment
          </p>
          <div className="space-y-2">
            {DIAGNOSTIC.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/30 p-3"
              >
                <item.icon size={16} strokeWidth={1.5} className="shrink-0 text-fuchsia-300/80" />
                <div className="flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">
                    {item.label}
                  </div>
                  <div className="font-mono text-[13px] text-white/90">{item.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ===========================================================================
   SECTION 4 — SIGNAL ENGINE
=========================================================================== */

function Section4SignalEngine() {
  return (
    <Section>
      <Eyebrow color="text-cyan-300">— Signal engine —</Eyebrow>
      <H2 accent="signals.">Raw evidence → clean signals.</H2>
      <Lead>
        Eleven engineered signals, derived from the two streams. Each one is named,
        traceable, and benchmarked against the peer group.
      </Lead>

      <div className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {SIGNALS.map((s, i) => (
          <motion.div
            key={s.signal}
            variants={fadeUp}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">
                  Raw input
                </div>
                <div className="mt-0.5 text-[12.5px] text-white/55">{s.raw}</div>
              </div>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                className="text-amber-300"
              >
                <ArrowRight size={18} strokeWidth={2} />
              </motion.div>
              <div className="flex-1 text-right">
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-amber-300/80">
                  Signal
                </div>
                <div className="mt-0.5 font-mono text-[14px] font-semibold text-white">{s.signal}</div>
                <div className="font-mono text-[11px] text-amber-300">{s.value}</div>
              </div>
            </div>

            <div className="mt-4 h-px overflow-hidden bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 via-amber-300 to-fuchsia-400"
                initial={{ scaleX: 0, transformOrigin: 'left' }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ===========================================================================
   SECTION 5 — BENCHMARKING UNIVERSE
=========================================================================== */

function Section5Benchmarking() {
  return (
    <Section>
      <Eyebrow color="text-cyan-300">— Benchmark —</Eyebrow>
      <H2 accent="universe of peers.">One company in a universe of peers.</H2>
      <Lead>
        Every signal is converted to a peer-relative percentile. The peer group is the
        closest available — falling back through three tiers when data is thin.
      </Lead>

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Scatter / constellation */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
                Peer constellation
              </div>
              <div className="mt-0.5 font-serif text-[18px] text-white/90">
                {COMPANY.peer_group}
              </div>
            </div>
            <span className="rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300">
              ● ACME · highlighted
            </span>
          </div>

          <div className="h-[340px] w-full">
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 10, right: 16, left: 0, bottom: 16 }}>
                <XAxis type="number" dataKey="x" name="Revenue size"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 9 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false}
                  label={{ value: 'Revenue scale →', position: 'insideBottom', offset: -8, fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                />
                <YAxis type="number" dataKey="y" name="EBITDA margin"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 9 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} tickLine={false}
                  label={{ value: 'Margin quality →', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                />
                <RTooltip
                  cursor={false}
                  contentStyle={{ background: 'rgba(10,14,26,0.92)', border: '1px solid rgba(245,165,36,0.4)', borderRadius: 8, fontFamily: 'monospace', fontSize: 11 }}
                />
                <Scatter
                  data={PEER_CLOUD}
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    const r = payload.highlight ? 9 : 3.5;
                    return (
                      <g>
                        {payload.highlight && (
                          <circle cx={cx} cy={cy} r={20} fill="rgba(245,165,36,0.25)" />
                        )}
                        <circle
                          cx={cx} cy={cy} r={r}
                          fill={payload.highlight ? 'rgb(245,165,36)' : 'rgba(255,255,255,0.35)'}
                          stroke={payload.highlight ? '#fff' : 'transparent'}
                          strokeWidth={payload.highlight ? 1.5 : 0}
                        />
                      </g>
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fallback tiers + percentile bars */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              Peer-group fallback
            </div>
            <div className="space-y-2.5">
              {[
                { n: 1, label: 'Closest AIDA peer group',  desc: '~640 companies, NACE 282 + size', active: true },
                { n: 2, label: 'NACE prefix cohort',       desc: 'NACE 28xx — broader machinery',  active: false },
                { n: 3, label: 'Calibrated priors',        desc: 'Italian SME defaults',           active: false },
              ].map(t => (
                <div key={t.n}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    t.active ? 'border-emerald-400/30 bg-emerald-400/[0.04]' : 'border-white/[0.06] bg-black/20 opacity-50'
                  }`}
                >
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                    t.active ? 'bg-emerald-400 text-zinc-950' : 'bg-white/10 text-white/40'
                  }`}>
                    {t.n}
                  </div>
                  <div>
                    <div className="font-mono text-[11.5px] font-semibold text-white/90">{t.label}</div>
                    <div className="text-[10.5px] text-white/40">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              Percentile ranks
            </div>
            <div className="space-y-3">
              {PERCENTILES.map((p, i) => (
                <div key={p.label}>
                  <div className="mb-1 flex items-baseline justify-between font-mono text-[11px]">
                    <span className="text-white/80">{p.label}</span>
                    <span className="text-white/90" style={{ color: p.color }}>p{p.p}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: p.color, boxShadow: `0 0 8px ${p.color}aa` }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.p}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ===========================================================================
   SECTION 6 — FOUR CAPITAL RADAR
=========================================================================== */

function Section6CapitalRadar() {
  const [active, setActive] = useState<string | null>(null);
  const radarData = CAPITALS.map(c => ({ name: c.name, score: c.score }));
  const composite = Math.round(CAPITALS.reduce((acc, c) => acc + (c.score * c.weight) / 100, 0));

  return (
    <Section>
      <Eyebrow color="text-cyan-300">— Capitals —</Eyebrow>
      <H2 accent="four capitals.">Quality is the weighted sum of four capitals.</H2>
      <Lead>
        Each capital scores its underlying signals, then weights into a composite
        Strategic Quality Score (CQS). The CQS becomes SQF in the value equation.
      </Lead>

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1.4fr]">
        {/* Radar */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              Capital radar
            </div>
            <div className="rounded-md border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 font-mono text-[11px] font-bold text-amber-300">
              CQS {composite}/100
            </div>
          </div>
          <div className="h-[360px]">
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius="78%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11, fontFamily: 'Inter, sans-serif' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }} />
                <Radar
                  dataKey="score"
                  stroke="rgb(245,165,36)"
                  fill="rgb(245,165,36)"
                  fillOpacity={0.22}
                  isAnimationActive
                  animationDuration={1400}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capital cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {CAPITALS.map((c, i) => (
            <motion.div
              key={c.key}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onMouseEnter={() => setActive(c.key)}
              onMouseLeave={() => setActive(null)}
              className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all hover:-translate-y-1"
              style={active === c.key ? { borderColor: c.color, background: `${c.color}10` } : undefined}
            >
              <div className="absolute left-0 top-0 h-1 w-full" style={{ background: c.color }} />
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="font-serif text-[18px] font-medium tracking-tight text-white/90">{c.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/40">weight {c.weight}%</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[28px] font-bold leading-none" style={{ color: c.color }}>
                    {c.score}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">/ 100</div>
                </div>
              </div>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: c.color, boxShadow: `0 0 10px ${c.color}88` }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${c.score}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, delay: i * 0.1 + 0.2 }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {c.signals.map(s => (
                  <span key={s} className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-white/55">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ===========================================================================
   SECTION 7 — VALUE EQUATION
=========================================================================== */

function Section7ValueEquation() {
  const TERMS = [
    { label: 'EBITDA',          value: '€750K',  sub: '3-yr normalised',          color: '#06b6d4' },
    { label: 'Sector multiple', value: '5.0×',   sub: 'NACE 282 · illiq.-adj.',   color: '#a855f7' },
    { label: 'SQF',             value: '1.05',   sub: 'Quality factor · 0.6–1.4', color: '#f5a524' },
    { label: 'GF',              value: '1.07',   sub: 'Growth · 0.7–1.5',         color: '#22c55e' },
  ];

  return (
    <Section>
      <Eyebrow color="text-cyan-300">— Value equation —</Eyebrow>
      <H2 accent="value equation.">One transparent value equation.</H2>
      <Lead>
        No black box. Each term has a defined range, a calibrated source, and a direct
        interpretation. Multiply, get V.
      </Lead>

      <div className="mt-14 rounded-3xl border border-amber-300/15 bg-gradient-to-br from-amber-500/[0.04] via-transparent to-fuchsia-500/[0.04] p-8 md:p-12">
        {/* Big formula */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
          {TERMS.map((t, i) => (
            <div key={t.label} className="flex items-center gap-3 md:gap-5">
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-2xl border border-white/10 bg-zinc-950/60 px-5 py-4 backdrop-blur"
                style={{ boxShadow: `0 8px 30px -10px ${t.color}33` }}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: t.color }}>
                  {t.label}
                </div>
                <div className="mt-1 font-mono text-[28px] font-bold tracking-tight text-white/95 md:text-[34px]">
                  {t.value}
                </div>
                <div className="mt-1 font-mono text-[10px] text-white/40">{t.sub}</div>
              </motion.div>

              {i < TERMS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.3 }}
                  className="font-mono text-[26px] text-white/30"
                >
                  ×
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Equals + result */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-10 flex flex-col items-center"
        >
          <div className="font-mono text-[20px] text-white/30">=</div>
          <div className="mt-3 flex flex-col items-center rounded-3xl border border-amber-300/40 bg-gradient-to-b from-amber-400/[0.10] to-amber-600/[0.04] px-10 py-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
              Enterprise Value today
            </div>
            <Counter to={BASE_V} prefix="€" suffix="M" decimals={1}
              className="mt-2 bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text font-mono text-[64px] font-bold leading-none tracking-tighter text-transparent md:text-[80px]"
            />
            <div className="mt-3 font-mono text-[11px] text-white/50">
              Range €3.8M – €4.7M
            </div>
          </div>
        </motion.div>

        {/* Outputs row */}
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Value today',      value: '€4.2M',  color: '#f5a524', icon: CircleDollarSign },
            { label: 'Potential',        value: '€5.8M',  color: '#22c55e', icon: TrendingUp },
            { label: 'Value gap',        value: '+38%',   color: '#22c55e', icon: Target },
            { label: 'Risk signal',      value: 'MEDIUM', color: '#f59e0b', icon: AlertTriangle },
          ].map((o, i) => (
            <motion.div key={o.label}
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 1 + i * 0.1 }}
              className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 p-4 backdrop-blur"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{o.label}</span>
                <o.icon size={14} style={{ color: o.color }} />
              </div>
              <div className="font-mono text-[22px] font-bold" style={{ color: o.color }}>{o.value}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ===========================================================================
   SECTION 8 — TOP 3 ACTION RANKING
=========================================================================== */

function Section8ActionRanking() {
  const top3 = CANDIDATE_ACTIONS.filter(a => a.top).sort((a, b) => (a.top ?? 0) - (b.top ?? 0));
  const rest = CANDIDATE_ACTIONS.filter(a => !a.top);
  const podiumHeights = [156, 200, 132]; // rank 2, 1, 3 (visually ordered 2-1-3)
  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2, 1, 3 positions

  return (
    <Section>
      <Eyebrow color="text-cyan-300">— Recommendation —</Eyebrow>
      <H2 accent="best three.">Nine candidate actions. The model picks the best three.</H2>
      <Lead>
        Every action enters with its own ΔValue, effort cost, time horizon, and the
        capital it moves. The ranking engine sorts by Return on Value — ΔV ÷ Effort.
      </Lead>

      {/* Candidate cloud */}
      <div className="mt-14">
        <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
          Candidate pool · 9 actions
        </div>
        <div className="flex flex-wrap gap-2">
          {CANDIDATE_ACTIONS.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-full border px-3 py-1.5 font-mono text-[10.5px] ${
                a.top
                  ? 'border-amber-300/50 bg-amber-300/[0.10] text-amber-300'
                  : 'border-white/10 bg-white/[0.03] text-white/50'
              }`}
            >
              {a.title} · +{a.uplift}% V
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ranking engine arrow */}
      <div className="my-10 flex items-center justify-center">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <Settings2 size={22} className="text-amber-300" />
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            ROV ranking engine
          </div>
        </motion.div>
      </div>

      {/* Podium */}
      <div className="mt-4 grid grid-cols-3 items-end gap-4">
        {podiumOrder.map((a, idx) => {
          if (!a) return <div key={idx} />;
          const rank = a.top ?? 0;
          const isFirst = rank === 1;
          return (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + idx * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div
                className={`mb-3 w-full rounded-2xl border p-4 ${
                  isFirst
                    ? 'border-amber-300/50 bg-gradient-to-b from-amber-400/[0.15] to-amber-500/[0.04]'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[12px] font-bold ${
                    isFirst ? 'bg-amber-300 text-zinc-950' : 'border border-white/15 bg-white/[0.05] text-white/70'
                  }`}>
                    {rank}
                  </span>
                  {isFirst && <Crown size={16} className="text-amber-300" />}
                </div>
                <div className="mb-1 font-serif text-[15px] font-medium leading-tight tracking-tight text-white/95">
                  {a.title}
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[10px] text-white/40">
                  <div>Uplift</div><div className="text-emerald-300">+{a.uplift}% V</div>
                  <div>Effort</div><div className="text-white/70">{'●'.repeat(a.effort)}{'○'.repeat(5 - a.effort)}</div>
                  <div>Time</div><div className="text-white/70">{a.time} mo</div>
                  <div>Capital</div><div className="text-white/70">{a.capital}</div>
                  <div>ROV</div><div className="text-amber-300">{a.rov.toFixed(3)}</div>
                </div>
              </div>
              <motion.div
                initial={{ scaleY: 0, transformOrigin: 'bottom' }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + idx * 0.15, duration: 0.6 }}
                className={`w-full rounded-t-lg border border-white/10 ${
                  isFirst ? 'bg-gradient-to-b from-amber-400 to-amber-600' : 'bg-gradient-to-b from-zinc-700 to-zinc-900'
                }`}
                style={{ height: podiumHeights[idx] }}
              />
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

/* ===========================================================================
   SECTION 9 — SCENARIO LAB (interactive)
=========================================================================== */

function Section9ScenarioLab() {
  const [s, setS] = useState({ concentration: false, recurring: false, digital: false, management: false });

  const sim = useMemo(() => {
    let sqf = BASE_SQF, gf = BASE_GF, riskTicks = 0;
    let cap = { fin: 68, tech: 54, human: 71, rel: 55 };
    (Object.keys(s) as (keyof typeof s)[]).forEach(k => {
      if (!s[k]) return;
      const d = SCENARIO_DELTAS[k];
      sqf += d.dSqf; gf += d.dGf; riskTicks += d.riskShift;
      Object.entries(d.capitalBoost).forEach(([key, boost]) => {
        cap[key as keyof typeof cap] = Math.min(100, cap[key as keyof typeof cap] + (boost as number));
      });
    });
    const v = 0.75 * 5.0 * sqf * gf;
    const potential = BASE_POTENTIAL;
    const gap = Math.round(((potential - v) / v) * 100);
    const risk = riskTicks <= -2 ? 'LOW' : riskTicks >= 1 ? 'HIGH' : 'MEDIUM';
    return { sqf, gf, v, gap, cap, risk };
  }, [s]);

  const LEVERS = [
    { key: 'concentration', label: 'Reduce client concentration', desc: '60% → <40% top-3' },
    { key: 'recurring',     label: 'Add recurring revenue',       desc: 'Subscription + multi-year' },
    { key: 'digital',       label: 'Improve digital maturity',    desc: 'Automation + ERP' },
    { key: 'management',    label: 'Strengthen management',       desc: 'Reduce founder dependency' },
  ] as const;

  const capCfg = CAPITALS.map(c => ({ ...c, score: sim.cap[c.key as keyof typeof sim.cap] }));

  return (
    <Section>
      <Eyebrow color="text-cyan-300">— Scenario lab —</Eyebrow>
      <H2 accent="moves the model.">Pull a lever. Watch the model respond.</H2>
      <Lead>
        Every toggle applies the calibrated impact to SQF, GF, capital scores, and the
        risk signal — no network call. The same math runs in production.
      </Lead>

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Levers */}
        <div className="space-y-3">
          {LEVERS.map(l => {
            const on = s[l.key];
            return (
              <button
                key={l.key}
                onClick={() => setS(prev => ({ ...prev, [l.key]: !prev[l.key] }))}
                className={`group flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                  on
                    ? 'border-amber-300/50 bg-amber-300/[0.06]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15'
                }`}
              >
                <div className={`relative flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                  on ? 'bg-amber-300' : 'bg-white/10'
                }`}>
                  <motion.div
                    className="h-5 w-5 rounded-full bg-white shadow"
                    animate={{ x: on ? 26 : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
                <div className="flex-1">
                  <div className={`font-mono text-[12px] font-bold uppercase tracking-[0.1em] ${on ? 'text-amber-200' : 'text-white/85'}`}>
                    {l.label}
                  </div>
                  <div className="font-mono text-[10.5px] text-white/40">{l.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live impact panel */}
        <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent p-6 md:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
              Live model state
            </div>
            <span className="rounded-md border border-emerald-400/30 bg-emerald-400/[0.10] px-2 py-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-emerald-300">
              ● Recomputing
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { l: 'V', v: `€${sim.v.toFixed(2)}M`, c: '#f5a524' },
              { l: 'Value gap', v: `${sim.gap > 0 ? '+' : ''}${sim.gap}%`, c: sim.gap > 0 ? '#22c55e' : '#ef4444' },
              { l: 'SQF', v: sim.sqf.toFixed(2), c: '#a855f7' },
              { l: 'GF', v: sim.gf.toFixed(2), c: '#06b6d4' },
            ].map(m => (
              <motion.div
                key={m.l}
                layout
                className="rounded-xl border border-white/[0.06] bg-black/30 p-3"
              >
                <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/40">{m.l}</div>
                <motion.div
                  key={m.v}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-1 font-mono text-[20px] font-bold" style={{ color: m.c }}
                >
                  {m.v}
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {capCfg.map(c => (
              <div key={c.key}>
                <div className="mb-1 flex items-baseline justify-between font-mono text-[10.5px]">
                  <span className="text-white/70">{c.name}</span>
                  <span style={{ color: c.color }}>{c.score}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: c.color, boxShadow: `0 0 8px ${c.color}88` }}
                    animate={{ width: `${c.score}%` }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/30 p-3">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/50">
              Risk signal
            </span>
            <span className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-bold tracking-[0.08em] ${
              sim.risk === 'LOW' ? 'bg-emerald-400/15 text-emerald-300' :
              sim.risk === 'HIGH' ? 'bg-rose-400/15 text-rose-300' :
              'bg-amber-400/15 text-amber-300'
            }`}>
              {sim.risk}
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ===========================================================================
   SECTION 10 — FINAL EXECUTIVE DASHBOARD
=========================================================================== */

function Section10Dashboard() {
  const radarData = CAPITALS.map(c => ({ name: c.name, score: c.score }));
  return (
    <Section>
      <Eyebrow color="text-cyan-300">— Product output —</Eyebrow>
      <H2 accent="dashboard.">The decision on one premium dashboard.</H2>
      <Lead>
        Everything the model produces — collapsed into one screen the entrepreneur
        can act on in five minutes.
      </Lead>

      <motion.div
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="mt-14 overflow-hidden rounded-3xl border border-white/[0.10] bg-gradient-to-b from-zinc-900/60 to-zinc-950/60 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] backdrop-blur"
      >
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 font-serif text-[16px] font-semibold text-white">
              {COMPANY.initials}
            </div>
            <div>
              <div className="font-serif text-[17px] tracking-tight text-white/95">{COMPANY.name}</div>
              <div className="font-mono text-[10.5px] text-white/40">
                {COMPANY.sector} · NACE {COMPANY.nace} · {COMPANY.province} · {COMPANY.lifecycle}
              </div>
            </div>
          </div>
          <span className="rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300">
            ● Diagnostic complete
          </span>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 px-6 pt-5 md:grid-cols-4">
          {[
            { l: 'Value today',   v: '€4.2M',  s: 'Range €3.8M–€4.7M',   c: '#f5a524' },
            { l: 'Value gap',     v: '+38%',   s: 'Potential €5.8M',     c: '#22c55e' },
            { l: 'Quality score', v: '67',     s: '/100 · above-avg',    c: '#06b6d4' },
            { l: 'Risk index',    v: 'MEDIUM', s: 'Client concentration',c: '#f59e0b' },
          ].map(k => (
            <div key={k.l} className="rounded-2xl border border-white/[0.06] bg-black/30 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">{k.l}</div>
              <div className="mt-1.5 font-mono text-[26px] font-bold tracking-tight" style={{ color: k.c }}>
                {k.v}
              </div>
              <div className="mt-1 font-mono text-[10.5px] text-white/45">{k.s}</div>
            </div>
          ))}
        </div>

        {/* Radar + Actions row */}
        <div className="grid grid-cols-1 gap-3 px-6 py-5 md:grid-cols-[0.9fr_1.3fr]">
          <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-5">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
              4-Capital radar
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                  <Radar dataKey="score" stroke="rgb(245,165,36)" fill="rgb(245,165,36)" fillOpacity={0.22} animationDuration={1200} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                Top 3 priority actions
              </div>
              <span className="font-mono text-[10px] text-white/35">Ranked by ROV</span>
            </div>
            {CANDIDATE_ACTIONS.filter(a => a.top).sort((a, b) => (a.top ?? 0) - (b.top ?? 0)).map((a, i, arr) => (
              <div key={a.title}
                className={`flex items-center gap-3.5 py-3.5 text-[13px] ${
                  i < arr.length - 1 ? 'border-b border-white/[0.04]' : 'pb-0'
                } ${i === 0 ? 'pt-0' : ''}`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/[0.12] font-mono text-[11px] font-bold text-amber-300">
                  {a.top}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white/95">{a.title}</div>
                  <div className="text-[11px] text-white/40">{a.capital} · ~{a.time} mo · effort {a.effort}/5</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[15px] font-bold text-emerald-300" style={{ textShadow: '0 0 10px rgba(34,197,94,0.4)' }}>
                    +{a.uplift}%
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">ΔV</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom signature */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] px-6 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
          <span>VIP · Value Intelligence Platform</span>
          <span>Diagnostic v1.0 · {new Date().getFullYear()}</span>
        </div>
      </motion.div>

      {/* Final tagline */}
      <motion.div
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="mt-24 text-center"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
          — Think big —
        </div>
        <h3
          className="mx-auto mt-4 max-w-[900px] font-serif font-normal leading-[1.05] text-white/90"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '-0.035em' }}
        >
          Don&rsquo;t design an algorithm.<br />
          Design a{' '}
          <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 bg-clip-text italic text-transparent">
            decision assistant.
          </span>
        </h3>
        <p className="mx-auto mt-5 max-w-[640px] text-[14px] leading-relaxed text-white/45">
          The model is only as good as the questions it knows how to ask. VIP asks the right
          twenty.
        </p>
      </motion.div>
    </Section>
  );
}

/* ===========================================================================
   ROOT
=========================================================================== */

export default function VipInfographic() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-white selection:bg-amber-300 selection:text-zinc-950">
      {/* Persistent backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 0%, rgba(245,165,36,0.10), transparent 60%), ' +
            'radial-gradient(ellipse 50% 40% at 0% 50%, rgba(168,85,247,0.05), transparent 60%), ' +
            'radial-gradient(ellipse 50% 40% at 100% 80%, rgba(6,182,212,0.05), transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 100% 80% at 50% 50%, #000 30%, transparent 80%)',
        }}
      />

      <div className="relative z-10">
        <Section1Hero />
        <Section2Journey />
        <Section3EvidenceStreams />
        <Section4SignalEngine />
        <Section5Benchmarking />
        <Section6CapitalRadar />
        <Section7ValueEquation />
        <Section8ActionRanking />
        <Section9ScenarioLab />
        <Section10Dashboard />
        <footer className="border-t border-white/[0.06] py-10 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
            VIP · Value Intelligence Platform · {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </div>
  );
}
