'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface ConstellationCapital {
  key: 'fin' | 'tech' | 'human' | 'rel';
  name: string;
  score: number;
  weight: number;
}

interface Props {
  capitals: ConstellationCapital[];
  sqf: number;
  /** Optional info slot rendered next to the SQF readout. */
  sqfInfo?: ReactNode;
  /** Per-capital info slot (info button). */
  capitalInfo?: (key: ConstellationCapital['key']) => ReactNode | null;
}

const COLOR: Record<ConstellationCapital['key'], string> = {
  fin:   'rgb(var(--cap-fin))',
  tech:  'rgb(var(--cap-tech))',
  human: 'rgb(var(--cap-human))',
  rel:   'rgb(var(--cap-rel))',
};

/**
 * CapitalConstellation — replaces the previous radar + list combo with
 * a calmer composition:
 *
 *   · diamond radar SVG (unchanged geometry — already calibrated)
 *   · horizontal bars showing each capital's score with its colour
 *
 * The composite SQF readout sits to the right with its info button.
 */
export function CapitalConstellation({ capitals, sqf, sqfInfo, capitalInfo }: Props) {
  const center = 120;
  const maxR = 90;
  const finScore   = (find(capitals, 'fin').score ?? 0) / 100;
  const techScore  = (find(capitals, 'tech').score ?? 0) / 100;
  const humanScore = (find(capitals, 'human').score ?? 0) / 100;
  const relScore   = (find(capitals, 'rel').score ?? 0) / 100;

  const pts = [
    [center, center - maxR * finScore],
    [center + maxR * techScore, center],
    [center, center + maxR * humanScore],
    [center - maxR * relScore, center],
  ].map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <svg viewBox="0 0 240 240" className="mx-auto h-auto w-full max-w-[260px]">
        {[0.25, 0.5, 0.75, 1].map((r) => {
          const offset = maxR * r;
          return (
            <polygon
              key={r}
              points={`${center},${center - offset} ${center + offset},${center} ${center},${center + offset} ${center - offset},${center}`}
              fill="none"
              stroke="rgb(var(--line) / 0.8)"
              strokeWidth={1}
            />
          );
        })}
        <line x1={center} y1={center - maxR} x2={center} y2={center + maxR} stroke="rgb(var(--line-2) / 0.6)" strokeDasharray="2 4" />
        <line x1={center - maxR} y1={center} x2={center + maxR} y2={center} stroke="rgb(var(--line-2) / 0.6)" strokeDasharray="2 4" />
        <polygon points={pts} fill="rgb(var(--gold) / 0.18)" stroke="rgb(var(--gold))" strokeWidth={1.5} />
        {[
          { x: center, y: center - maxR * finScore, color: COLOR.fin },
          { x: center + maxR * techScore, y: center, color: COLOR.tech },
          { x: center, y: center + maxR * humanScore, color: COLOR.human },
          { x: center - maxR * relScore, y: center, color: COLOR.rel },
        ].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={p.color} />
        ))}
        <text x={center} y={18}         textAnchor="middle" fontSize="11" fill="rgb(var(--text-dim))">Financial</text>
        <text x={232}    y={center + 4} textAnchor="end"    fontSize="11" fill="rgb(var(--text-dim))">Technological</text>
        <text x={center} y={232}        textAnchor="middle" fontSize="11" fill="rgb(var(--text-dim))">Human</text>
        <text x={8}      y={center + 4} textAnchor="start"  fontSize="11" fill="rgb(var(--text-dim))">Relational</text>
      </svg>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3 rounded-lg border border-line bg-bg-2/30 px-4 py-2.5">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
            <span>Strategic Quality Factor</span>
            {sqfInfo}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[24px] font-medium leading-none tracking-tight text-text">
              {sqf.toFixed(2)}
            </span>
            <span className="font-mono text-[10.5px] text-text-faint">0.6 – 1.4</span>
          </div>
        </div>

        <ul className="space-y-2">
          {capitals.map((c) => (
            <li key={c.key}>
              <div className="flex items-center gap-3 text-[12.5px]">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: COLOR[c.key] }}
                />
                <span className="flex flex-1 items-center gap-1.5 text-text">
                  {c.name}
                  {capitalInfo?.(c.key)}
                </span>
                <span className="font-mono text-[10.5px] text-text-faint">w {c.weight}%</span>
                <span className="w-10 text-right font-mono text-[13px] font-semibold text-text">
                  {c.score}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bg-2">
                <div
                  className={cn('h-full rounded-full transition-[width] duration-700 ease-out')}
                  style={{
                    width: `${Math.max(0, Math.min(100, c.score))}%`,
                    background: COLOR[c.key],
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function find(list: ConstellationCapital[], key: ConstellationCapital['key']): ConstellationCapital {
  return list.find((c) => c.key === key) ?? { key, name: key, score: 0, weight: 0 };
}
