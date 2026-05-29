'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { cn } from '@/lib/cn';

const POPOVER_WIDTH = 300;
const VIEWPORT_PADDING = 12;
const GAP = 8;

export interface ExplanationStep {
  label?: string;
  value?: string;
  note?: string;
}

export interface Explanation {
  title: string;
  source: string;
  steps: ExplanationStep[];
  result?: string;
}

interface InfoButtonProps {
  explanation: Explanation;
  align?: 'left' | 'right';
  ariaLabel?: string;
  className?: string;
}

interface Position {
  top: number;
  left: number;
}

export function InfoButton({
  explanation,
  align = 'right',
  ariaLabel,
  className,
}: InfoButtonProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    function compute() {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const popH = popoverRef.current?.offsetHeight ?? 260;

      // Horizontal: default to align (right → popover extends right from button).
      // Flip if not enough room.
      let left: number;
      const wantsRight = align === 'right';
      const spaceRight = vw - rect.left - VIEWPORT_PADDING;
      const spaceLeft = rect.right - VIEWPORT_PADDING;
      const flipToLeft = wantsRight && spaceRight < POPOVER_WIDTH && spaceLeft >= POPOVER_WIDTH;
      const flipToRight = !wantsRight && spaceLeft < POPOVER_WIDTH && spaceRight >= POPOVER_WIDTH;

      if ((wantsRight && !flipToLeft) || flipToRight) {
        left = rect.left;
      } else {
        left = rect.right - POPOVER_WIDTH;
      }
      // Final clamp inside viewport.
      left = Math.max(VIEWPORT_PADDING, Math.min(left, vw - POPOVER_WIDTH - VIEWPORT_PADDING));

      // Vertical: prefer below; flip above if no room.
      const spaceBelow = vh - rect.bottom - VIEWPORT_PADDING;
      let top: number;
      if (spaceBelow >= popH + GAP || rect.top < popH + GAP) {
        top = rect.bottom + GAP;
      } else {
        top = rect.top - popH - GAP;
      }
      top = Math.max(VIEWPORT_PADDING, Math.min(top, vh - popH - VIEWPORT_PADDING));

      setPosition({ top, left });
    }

    compute();
    // Recompute after popover renders (so we know its real height).
    const raf = requestAnimationFrame(compute);

    window.addEventListener('scroll', compute, true);
    window.addEventListener('resize', compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', compute, true);
      window.removeEventListener('resize', compute);
    };
  }, [open, align]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label={ariaLabel ?? `How ${explanation.title} is calculated`}
        aria-expanded={open}
        className={cn(
          'inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/[0.08] text-gold transition-colors hover:border-gold/70 hover:bg-gold/[0.18]',
          open && 'border-gold bg-gold/[0.24]',
          className,
        )}
      >
        <Info size={11} strokeWidth={2.5} />
      </button>

      {open && mounted && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={popoverRef}
              role="dialog"
              aria-label={`${explanation.title} — calculation breakdown`}
              style={{
                position: 'fixed',
                top: position?.top ?? -9999,
                left: position?.left ?? -9999,
                width: POPOVER_WIDTH,
                opacity: position ? 1 : 0,
              }}
              className="z-[1000] rounded-lg border border-line bg-bg-1 p-4 text-left shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
            >
              <div className="mb-1 font-serif text-[14px] font-medium leading-tight text-text">
                {explanation.title}
              </div>
              <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
                {explanation.source}
              </div>

              {explanation.steps.length > 0 && (
                <ol className="space-y-2.5">
                  {explanation.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-[12px] leading-snug">
                      <span className="mt-[1px] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-bg-2 font-mono text-[10px] font-semibold text-text-dim">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        {(step.label || step.value) && (
                          <div className="flex items-baseline justify-between gap-2">
                            {step.label && (
                              <span className="text-text-dim">{step.label}</span>
                            )}
                            {step.value && (
                              <span className="break-all text-right font-mono text-[11.5px] font-semibold text-text">
                                {step.value}
                              </span>
                            )}
                          </div>
                        )}
                        {step.note && (
                          <div className="mt-0.5 text-[11.5px] leading-snug text-text-faint">
                            {step.note}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              {explanation.result && (
                <div className="mt-3 border-t border-line-faint pt-3">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-eyebrow text-text-faint">
                    Result
                  </div>
                  <div className="mt-1 font-serif text-[16px] font-medium tracking-tight text-text">
                    {explanation.result}
                  </div>
                </div>
              )}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
