import { Hero }         from '@/components/marketing/scenes/hero';
import { Problem }      from '@/components/marketing/scenes/problem';
import { Capabilities } from '@/components/marketing/scenes/capabilities';
import { Capitals }     from '@/components/marketing/scenes/capitals';
import { Formula }      from '@/components/marketing/scenes/formula';
import { InputEngine }  from '@/components/marketing/scenes/input-engine';
import { Engines }      from '@/components/marketing/scenes/engines';
import { Dashboard }    from '@/components/marketing/scenes/dashboard';
import { Architecture } from '@/components/marketing/scenes/architecture';
import { Closing }      from '@/components/marketing/scenes/closing';

/**
 * Marketing home — the scrollytelling pitch.
 *
 * Each scene is its own client component and fades in via the
 * `useReveal` IntersectionObserver hook (+ informative animations like
 * count-ups and the radar morph). Order matters — the narrative reads
 * top-to-bottom.
 */
export default function MarketingHome() {
  return (
    <>
      <Hero />
      <Problem />
      <Capabilities />
      <Capitals />
      <Formula />
      <InputEngine />
      <Engines />
      <Dashboard />
      <Architecture />
      <Closing />

      <footer className="mt-20 border-t border-line px-8 py-10 text-center">
        <div className="flex flex-wrap justify-center gap-3.5 font-mono text-[11px] tracking-[0.08em] text-text-faint">
          <span>VIP · Value Intelligence Platform</span>
          <span>·</span>
          <span>v1.0 — Design &amp; Architecture</span>
          <span>·</span>
          <span>Master in Data Science for Management · Cattolica</span>
        </div>
      </footer>
    </>
  );
}
