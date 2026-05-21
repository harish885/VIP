'use client';

import { useReveal } from '@/lib/use-reveal';
import { SceneHeader } from '@/components/marketing/scene-header';
import { Key, Shield, FunctionSquare, Eye } from 'lucide-react';

interface ColRow {
  name: string;
  type: string;
  tag?: 'PK' | 'FK' | 'JSONB' | 'GEN';
}

const TABLES: Array<{
  key: string;
  title: string;
  kind: 'calibration' | 'user' | 'view';
  cols: ColRow[];
}> = [
  // Calibration block
  {
    key: 'context',
    title: 'vip.context',
    kind: 'calibration',
    cols: [
      { name: 'tax_code', type: 'text', tag: 'PK' },
      { name: 'company_name', type: 'text' },
      { name: 'peer_group_name', type: 'text' },
      { name: 'nace_rev_2', type: 'text' },
      { name: 'ateco_2007_code', type: 'text' },
      { name: 'province', type: 'text' },
      { name: 'size_estimate', type: 'text' },
      { name: 'payload', type: 'jsonb', tag: 'JSONB' },
    ],
  },
  {
    key: 'financial_capital',
    title: 'vip.financial_capital',
    kind: 'calibration',
    cols: [
      { name: 'tax_code', type: 'text', tag: 'PK' },
      { name: 'peer_group_name', type: 'text' },
      { name: 'payload', type: 'jsonb', tag: 'JSONB' },
    ],
  },
  {
    key: 'technological_capital',
    title: 'vip.technological_capital',
    kind: 'calibration',
    cols: [
      { name: 'tax_code', type: 'text', tag: 'PK' },
      { name: 'peer_group_name', type: 'text' },
      { name: 'payload', type: 'jsonb', tag: 'JSONB' },
    ],
  },
  {
    key: 'human_organisational',
    title: 'vip.human_organisational',
    kind: 'calibration',
    cols: [
      { name: 'tax_code', type: 'text', tag: 'PK' },
      { name: 'peer_group_name', type: 'text' },
      { name: 'payload', type: 'jsonb', tag: 'JSONB' },
    ],
  },
  {
    key: 'relational_capital',
    title: 'vip.relational_capital',
    kind: 'calibration',
    cols: [
      { name: 'tax_code', type: 'text', tag: 'PK' },
      { name: 'peer_group_name', type: 'text' },
      { name: 'payload', type: 'jsonb', tag: 'JSONB' },
    ],
  },
  // View
  {
    key: 'aida_company_snapshot',
    title: 'vip.aida_company_snapshot',
    kind: 'view',
    cols: [
      { name: 'tax_code', type: 'text' },
      { name: 'company_name', type: 'text' },
      { name: 'revenue_last_thk', type: 'numeric', tag: 'GEN' },
      { name: 'ebitda_last_thk', type: 'numeric', tag: 'GEN' },
      { name: 'ebitda_margin_pct', type: 'numeric', tag: 'GEN' },
      { name: 'employees', type: 'numeric', tag: 'GEN' },
      { name: 'rd_expense_thk', type: 'numeric', tag: 'GEN' },
      { name: 'net_financial_position_thk', type: 'numeric', tag: 'GEN' },
      { name: '… ~40 cols', type: '' },
    ],
  },
  // User block
  {
    key: 'profiles',
    title: 'vip.profiles',
    kind: 'user',
    cols: [
      { name: 'id', type: 'uuid', tag: 'PK' },
      { name: 'full_name', type: 'text' },
      { name: 'company_name', type: 'text' },
      { name: 'created_at', type: 'timestamptz' },
    ],
  },
  {
    key: 'companies',
    title: 'vip.companies',
    kind: 'user',
    cols: [
      { name: 'id', type: 'uuid', tag: 'PK' },
      { name: 'user_id', type: 'uuid', tag: 'FK' },
      { name: 'tax_code', type: 'text' },
      { name: 'name', type: 'text' },
      { name: 'sector', type: 'text' },
      { name: 'nace_code', type: 'text' },
      { name: 'lifecycle_stage', type: 'text' },
    ],
  },
  {
    key: 'submissions',
    title: 'vip.submissions',
    kind: 'user',
    cols: [
      { name: 'id', type: 'uuid', tag: 'PK' },
      { name: 'company_id', type: 'uuid', tag: 'FK' },
      { name: 'revenue_y_1/2/3', type: 'numeric' },
      { name: 'ebitda', type: 'numeric' },
      { name: '6× legacy qual', type: 'int 1-5' },
      { name: '11× new qual (q_*)', type: 'int 1-5' },
    ],
  },
  {
    key: 'valuations',
    title: 'vip.valuations',
    kind: 'user',
    cols: [
      { name: 'id', type: 'uuid', tag: 'PK' },
      { name: 'submission_id', type: 'uuid', tag: 'FK' },
      { name: 'v_current_eur', type: 'numeric' },
      { name: 'v_low / v_high / v_potential', type: 'numeric' },
      { name: 'ebitda_norm · m_sector · sqf · gf', type: 'numeric' },
      { name: 'quality_score · risk_index', type: 'mixed' },
      { name: 'cap_financial / technological / human / relational', type: 'numeric' },
      { name: 'flags', type: 'text[]' },
    ],
  },
  {
    key: 'recommendations',
    title: 'vip.recommendations',
    kind: 'user',
    cols: [
      { name: 'id', type: 'uuid', tag: 'PK' },
      { name: 'valuation_id', type: 'uuid', tag: 'FK' },
      { name: 'rank', type: 'int 1-3' },
      { name: 'title · description', type: 'text' },
      { name: 'v_uplift_pct · rov_score', type: 'numeric' },
    ],
  },
];

const RPCS = [
  {
    name: 'vip.percentile_in_peer_group',
    sig: '(p_peer_group, p_capital_table, p_jsonb_path, p_value, p_higher_is_better) → numeric',
    note: 'STABLE · SECURITY DEFINER. Returns 0–100 percentile rank within peer group. NULL when peer < 20 obs (caller falls back to NACE prefix RPC, then synthetic prior).',
  },
  {
    name: 'vip._to_numeric',
    sig: '(s text) → numeric',
    note: 'IMMUTABLE · PARALLEL SAFE. Coerces text → numeric; "n.a.", "n.s.", "—", "" return NULL. Used in every snapshot column.',
  },
];

const RLS_POLICIES = [
  { tbl: 'context + 4 capital tables', rule: 'SELECT: TO PUBLIC USING (true). INSERT/UPDATE/DELETE: service_role only.' },
  { tbl: 'profiles', rule: 'auth.uid() = id (self-row only).' },
  { tbl: 'companies · submissions · valuations · recommendations', rule: 'USING / WITH CHECK (user_id = auth.uid()). Demo mode: user_id IS NULL allowed.' },
];

export function SchemaGraph() {
  const ref = useReveal<HTMLDivElement>();
  const calibration = TABLES.filter((t) => t.kind === 'calibration');
  const view = TABLES.find((t) => t.kind === 'view')!;
  const user = TABLES.filter((t) => t.kind === 'user');

  return (
    <section id="schema" className="relative mx-auto max-w-[1280px] px-8 py-28">
      <SceneHeader
        eyebrow="Database schema"
        title="One schema: vip."
        accent="vip."
        lead="Two halves. Left: read-only calibration set, JSONB-shaped, 14,999 rows. Right: per-user submission lineage. A flat SQL view bridges them for the application."
      />

      <div ref={ref} className="reveal space-y-6">
        {/* Calibration block */}
        <div>
          <BlockLabel color="purple">Calibration (read-only · seeded once · RLS public-select)</BlockLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {calibration.map((t) => <TableCard key={t.key} table={t} accent="purple" />)}
          </div>
        </div>

        {/* Arrow row */}
        <div className="flex justify-center font-mono text-[11px] text-text-faint">
          ↓ joined via tax_code (LEFT JOIN context + 4 capital tables) ↓
        </div>

        {/* View row */}
        <div>
          <BlockLabel color="gold" icon={<Eye size={11} />}>View (queried by every page)</BlockLabel>
          <div className="mx-auto max-w-[520px]">
            <TableCard table={view} accent="gold" />
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center font-mono text-[11px] text-text-faint">
          ↓ read by lib/aida.ts + lib/scoring/benchmarks.ts (peer percentile lookup) ↓
        </div>

        {/* User block */}
        <div>
          <BlockLabel color="cyan">User-facing (per-row RLS, FK chain)</BlockLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {user.map((t) => <TableCard key={t.key} table={t} accent="cyan" />)}
          </div>
          <div className="mt-2 flex justify-between px-1 font-mono text-[10.5px] uppercase tracking-eyebrow text-text-faint">
            <span>↑ auth.users.id</span>
            <span>FK → company_id</span>
            <span>FK → submission_id</span>
            <span>FK → valuation_id</span>
            <span></span>
          </div>
        </div>

        {/* RPCs */}
        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="glass p-6">
            <div className="mb-4 flex items-center gap-2">
              <FunctionSquare size={16} className="text-gold" />
              <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-gold">
                RPC functions
              </div>
            </div>
            <div className="space-y-4">
              {RPCS.map((r) => (
                <div key={r.name}>
                  <div className="font-mono text-[12.5px] font-semibold text-text">{r.name}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-text-faint">{r.sig}</div>
                  <div className="mt-1 text-[12.5px] leading-relaxed text-text-dim">{r.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-6">
            <div className="mb-4 flex items-center gap-2">
              <Shield size={16} className="text-red" />
              <div className="font-mono text-[10px] font-bold uppercase tracking-eyebrow text-red">
                Row-Level Security
              </div>
            </div>
            <div className="space-y-3">
              {RLS_POLICIES.map((p, i) => (
                <div key={i} className="text-[12.5px] leading-relaxed">
                  <div className="font-mono font-semibold text-text">{p.tbl}</div>
                  <div className="text-text-dim">{p.rule}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlockLabel({
  children,
  color,
  icon,
}: {
  children: React.ReactNode;
  color: 'purple' | 'gold' | 'cyan';
  icon?: React.ReactNode;
}) {
  const tone = color === 'purple' ? 'text-purple bg-purple/[0.08]'
    : color === 'gold' ? 'text-gold bg-gold/[0.08]'
    : 'text-cyan bg-cyan/[0.08]';
  return (
    <div className={`mb-3 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-eyebrow ${tone}`}>
      {icon}
      {children}
    </div>
  );
}

function TableCard({
  table,
  accent,
}: {
  table: (typeof TABLES)[number];
  accent: 'purple' | 'cyan' | 'gold';
}) {
  const borderTone = accent === 'purple' ? 'border-purple/30 hover:border-purple/60'
    : accent === 'gold' ? 'border-gold/30 hover:border-gold/60'
    : 'border-cyan/30 hover:border-cyan/60';
  const headerTone = accent === 'purple' ? 'text-purple'
    : accent === 'gold' ? 'text-gold'
    : 'text-cyan';
  return (
    <div className={`group rounded-lg border ${borderTone} bg-bg-1/80 p-3 transition-colors`}>
      <div className={`mb-2 font-mono text-[11px] font-bold ${headerTone}`}>
        {table.title}
      </div>
      <ul className="space-y-0.5">
        {table.cols.map((c) => (
          <li key={c.name} className="flex items-center gap-1.5 font-mono text-[10.5px]">
            {c.tag === 'PK' && <Key size={9} className="shrink-0 text-amber" />}
            {c.tag === 'FK' && <Key size={9} className="shrink-0 text-cyan" />}
            <span className="truncate text-text-dim">{c.name}</span>
            <span className="ml-auto shrink-0 text-text-faint">{c.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
