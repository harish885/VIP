'use client';

import { useEffect, useRef } from 'react';

/**
 * useReveal — drop-in IntersectionObserver hook.
 *
 * Add the returned ref to any element. When the element enters the viewport
 * we add the `is-visible` class — pair with `.reveal` in globals.css to get
 * a clean opacity + transform fade-up.
 *
 * Replaces the heavy GSAP timeline orchestration we used in cinematic mode.
 * One observer per section, disconnected after the first hit, zero JS on
 * idle.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reveal immediately if reduced-motion is preferred.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      options,
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return ref;
}
