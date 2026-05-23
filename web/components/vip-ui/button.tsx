import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'primary' | 'subtle' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const TONE: Record<Tone, string> = {
  primary:
    'border-gold/55 bg-gold/[0.14] text-gold hover:bg-gold/[0.22] hover:border-gold/75 focus-visible:ring-gold/40',
  subtle:
    'border-line bg-bg-1 text-text-dim hover:border-line-2 hover:text-text focus-visible:ring-line-2',
  ghost:
    'border-transparent text-text-dim hover:bg-bg-2/60 hover:text-text focus-visible:ring-line-2',
  danger:
    'border-red/45 bg-red/[0.08] text-red hover:bg-red/[0.16] focus-visible:ring-red/40',
};

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12px] gap-1.5 rounded-md',
  md: 'h-9 px-3.5 text-[12.5px] gap-1.5 rounded-md',
  lg: 'h-10 px-4 text-[13px] gap-2 rounded-lg',
};

interface BaseProps {
  tone?: Tone;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type LinkProps  = BaseProps & { href: string; type?: never; disabled?: boolean };

export type ButtonOrLinkProps = ButtonProps | LinkProps;

/**
 * Button — the single button recipe used across the studio.
 *
 * Pass `href` to render as a `<Link>`; otherwise it's a `<button>`.
 * All variants carry consistent focus rings + disabled fade so
 * keyboard users never lose track of focus.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonOrLinkProps>(function Button(
  { tone = 'subtle', size = 'md', icon, iconRight, className, children, ...rest },
  ref,
) {
  const base = cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap border font-semibold',
    'transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-bg-1',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    TONE[tone],
    SIZE[size],
    className,
  );

  if ('href' in rest && rest.href) {
    const { href, disabled, ...linkRest } = rest as LinkProps;
    if (disabled) {
      return (
        <span className={cn(base, 'pointer-events-none opacity-50')} aria-disabled="true">
          {icon}
          <span className="truncate">{children}</span>
          {iconRight}
        </span>
      );
    }
    return (
      <Link href={href} className={base} {...linkRest}>
        {icon}
        <span className="truncate">{children}</span>
        {iconRight}
      </Link>
    );
  }

  const { type, ...buttonRest } = rest as ButtonProps;
  return (
    <button ref={ref} type={type ?? 'button'} className={base} {...buttonRest}>
      {icon}
      <span className="truncate">{children}</span>
      {iconRight}
    </button>
  );
});
