'use client';

import { cn } from '@/lib/cn';

/**
 * Field primitives shared by login + signup + onboarding forms.
 * All styled with the VIP design tokens — dark surface, gold focus ring,
 * mono labels with eyebrow tracking.
 */

export function Field({
  label,
  hint,
  children,
  required,
  error,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="mb-4 flex flex-col gap-1.5 last:mb-0">
      <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-eyebrow text-text-dim">
        {label}
        {required && <span className="text-gold">*</span>}
      </span>
      {children}
      {hint && !error && <span className="text-[11px] text-text-faint">{hint}</span>}
      {error && <span className="text-[11px] text-red">{error}</span>}
    </label>
  );
}

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-lg border border-line bg-bg-2/70 px-3.5 py-2.5',
        'font-sans text-[14px] text-text placeholder:text-text-faint',
        'transition-all duration-200',
        'focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    />
  );
}

export function PrimaryButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'group relative w-full overflow-hidden rounded-lg px-4 py-3',
        'bg-gradient-to-r from-gold to-gold-soft text-bg',
        'font-mono text-[11px] font-bold uppercase tracking-eyebrow',
        'transition-all duration-200',
        'hover:shadow-[0_8px_24px_-8px_rgba(245,165,36,0.6)]',
        'active:translate-y-px',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'w-full rounded-lg border border-line bg-bg-2/50 px-4 py-2.5',
        'font-mono text-[11px] font-bold uppercase tracking-eyebrow text-text-dim',
        'transition-all duration-200',
        'hover:border-line-2 hover:bg-bg-2 hover:text-text',
        'active:translate-y-px',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-red/30 bg-red/[0.08] px-3.5 py-2.5 text-[13px] text-red">
      {message}
    </div>
  );
}

export function FormSuccess({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg border border-green/30 bg-green/[0.08] px-3.5 py-2.5 text-[13px] text-green">
      {message}
    </div>
  );
}
