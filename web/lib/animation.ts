import gsap from 'gsap';

/**
 * animateCount — eased numeric count-up.
 * Writes the formatted number to `el.textContent` on each tick.
 */
export function animateCount(
  el: HTMLElement,
  target: number,
  opts: {
    duration?: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
  } = {},
) {
  const { duration = 1.6, suffix = '', prefix = '', decimals = 0 } = opts;
  const obj = { v: 0 };
  return gsap.to(obj, {
    v: target,
    duration,
    ease: 'power3.out',
    onUpdate: () => {
      const formatted = decimals > 0
        ? obj.v.toFixed(decimals)
        : Math.round(obj.v).toLocaleString();
      el.textContent = `${prefix}${formatted}${suffix}`;
    },
  });
}

/**
 * Standard ease used across the marketing surface for entrance reveals.
 */
export const REVEAL_EASE = 'power3.out';

/**
 * Standard ScrollTrigger start position for "as the top of this element
 * crosses 80% of the viewport from the top." Used for fade-in reveals.
 */
export const REVEAL_START = 'top 80%';
