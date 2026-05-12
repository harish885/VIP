'use client';

import { forwardRef, useState, useEffect } from 'react';
import { displayNumber, parseNumberInput } from '@/lib/format';
import { cn } from '@/lib/cn';

type Props = {
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  prefix?: string;   // e.g. '€'
  suffix?: string;   // e.g. '%'
  placeholder?: string;
  disabled?: boolean;
  inputMode?: 'numeric' | 'decimal';
  step?: number;
  max?: number;
  error?: string;
};

/**
 * NumberField — typed-number input with prefix/suffix and on-the-fly
 * thousand separators. While the user is typing we keep the raw string in
 * local state so the cursor doesn't jump; on blur we format the display.
 *
 * Returns NaN/undefined upstream when the field is empty — RHF + Zod
 * handle the "required" message.
 */
export const NumberField = forwardRef<HTMLInputElement, Props>(function NumberField(
  { value, onChange, prefix, suffix, placeholder, disabled, inputMode = 'numeric', step, max, error },
  ref,
) {
  const [text, setText] = useState<string>(() => displayNumber(value));

  // Keep local display in sync when an outside source resets the value
  // (e.g. "Fill with example values").
  useEffect(() => {
    setText(displayNumber(value));
  }, [value]);

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          'group relative flex items-center rounded-lg border bg-black/30 transition-all duration-200',
          error ? 'border-red/50' : 'border-line focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30',
          disabled && 'opacity-50',
        )}
      >
        {prefix && (
          <span className="select-none pl-3.5 pr-1 font-mono text-[13px] text-text-faint">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          type="text"
          inputMode={inputMode}
          placeholder={placeholder}
          disabled={disabled}
          value={text}
          onChange={(e) => {
            const raw = e.target.value;
            setText(raw);
            const n = parseNumberInput(raw);
            if (Number.isNaN(n)) {
              onChange(undefined);
            } else if (max !== undefined && n > max) {
              onChange(max);
            } else {
              onChange(n);
            }
          }}
          onBlur={() => {
            // Reformat on blur once the value is committed
            if (typeof value === 'number' && !Number.isNaN(value)) {
              setText(displayNumber(value));
            }
          }}
          className={cn(
            'w-full bg-transparent py-2.5 font-sans text-[14px] text-text placeholder:text-text-faint focus:outline-none',
            prefix ? 'pl-1' : 'pl-3.5',
            suffix ? 'pr-1' : 'pr-3.5',
            'disabled:cursor-not-allowed',
          )}
          step={step}
        />
        {suffix && (
          <span className="select-none pl-1 pr-3.5 font-mono text-[13px] text-text-faint">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="font-mono text-[10.5px] text-red">{error}</span>}
    </div>
  );
});
