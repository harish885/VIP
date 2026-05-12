/**
 * Phase 08 acceptance smoke test.
 *
 * Runs the scoring pipeline + the recommendation engine against the ACME
 * example profile and prints the resulting Top-3. Expected ordering:
 *
 *   1. Reduce client concentration  (~+12% V, SQF +0.12)
 *   2. Recurring revenue            (~+9%  V, GF +0.15)
 *   3. Strengthen middle management (~+7%  V, SQF +0.08)
 *
 * Exits 1 if the Top-3 does not contain those three IDs.
 */
import { EXAMPLE_DIAGNOSTIC } from '../lib/diagnostic-schema';
import { runScoring, buildRecommendations } from '../lib/scoring';

async function main() {
  const scoring = await runScoring(EXAMPLE_DIAGNOSTIC, { naceCode: '282' });
  const recos = buildRecommendations({ scoring, naceCode: '282' });

  console.log('--- ACME Top-3 recommendations ---');
  for (const r of recos) {
    console.log(
      `${r.rank}. ${r.title.padEnd(36)}  ΔV=${r.v_uplift_pct.toFixed(1).padStart(4)}%  ` +
        `Δ€=${(r.delta_v_eur / 1000).toFixed(0).padStart(5)}k  ROV=${r.rov_score.toFixed(2)}  ` +
        `(${r.capital_impact})`,
    );
  }

  const idsRequired = new Set(['reduce_client_concentration', 'recurring_revenue', 'middle_management']);
  const idsGot = new Set(recos.map((r) => r.id));
  const missing = [...idsRequired].filter((id) => !idsGot.has(id));

  if (missing.length > 0) {
    console.error(`\nMissing expected actions: ${missing.join(', ')}`);
    console.error('Tune ACTION_CATALOGUE fires_when predicates or objective weights.');
    process.exit(1);
  }
  console.log('\nAll three expected actions present in Top-3.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
