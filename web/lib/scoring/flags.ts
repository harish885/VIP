/**
 * Phase 06 — Fragility flags & Risk Index.
 *
 * A flag fires when the submission crosses a known risk threshold. The
 * count of fired flags determines the qualitative Risk Index shown on
 * the dashboard:
 *
 *   0 fired         → LOW
 *   1–2 fired       → MEDIUM
 *   ≥ 3 fired       → HIGH
 *
 * `over_leveraged` would require a debt input the diagnostic form does
 * not currently collect — we approximate from EBITDA margin instead so
 * the flag still meaningfully fires for thin-margin operators.
 */
import type { ScoringInput } from './company-input';
import type { DerivedMetrics, FragilityFlag, RiskIndex } from './types';

export function deriveFragilityFlags(
  input: ScoringInput,
  metrics: DerivedMetrics,
): FragilityFlag[] {
  const fired: FragilityFlag[] = [];

  if (input.top3_client_concentration > 50) {
    fired.push('client_concentration');
  }
  // Q5 scale: 1 = severely affected (high dependency), 5 = minimally affected.
  if (input.founder_dependency <= 1) {
    fired.push('founder_dependency');
  }
  if (input.digital_maturity <= 1) {
    fired.push('low_digital');
  }
  // Approximation of "over-leveraged": very thin EBITDA margin signals
  // fragility from interest cover even without a debt input on the form.
  if (metrics.ebitda_margin_pct < 3) {
    fired.push('over_leveraged');
  }

  return fired;
}

export function riskIndex(flags: ReadonlyArray<FragilityFlag>): RiskIndex {
  if (flags.length === 0) return 'LOW';
  if (flags.length <= 2) return 'MEDIUM';
  return 'HIGH';
}
