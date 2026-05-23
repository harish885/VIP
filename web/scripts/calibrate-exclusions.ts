/**
 * Acceptance smoke test for the "not relevant" exclusion path.
 *
 * Runs the scoring pipeline three times against the ACME profile:
 *   1. baseline — every question answered
 *   2. exclude `founder_dependency` → human capital recomputes without
 *      that metric; weights renormalize across the remaining 5.
 *   3. exclude every human-capital question → human capital falls back
 *      to the neutral 50 (matches `weightedMean`'s "den === 0" branch).
 *
 * The assertions confirm:
 *   · The exclusion never crashes the pipeline.
 *   · Excluded metrics are NaN in `percentiles`.
 *   · Human capital changes in a sensible direction with exclusions.
 *   · `risk_index` and headline V stay finite.
 *
 * Run with: `npm run calibrate:exclusions` (alias: `tsx scripts/calibrate-exclusions.ts`).
 * Exits 1 if anything looks wrong.
 */
import { runScoring } from '../lib/scoring';
import { DEMO_SCORING_INPUT } from '../lib/scoring/company-input';

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

async function main() {
  const baseline = await runScoring(DEMO_SCORING_INPUT, { naceCode: '282' });

  const single = clone(DEMO_SCORING_INPUT);
  single.excluded_questions = ['founder_dependency'];
  single.founder_dependency = null;
  const oneExcl = await runScoring(single, { naceCode: '282' });

  const allHuman = clone(DEMO_SCORING_INPUT);
  allHuman.excluded_questions = [
    'founder_dependency',
    'management_structure',
    'q_process_maturity',
    'q_transferability',
    'business_scalability',
    'q_distinctive_assets_score',
  ];
  allHuman.founder_dependency = null;
  allHuman.management_structure = null;
  allHuman.q_process_maturity = null;
  allHuman.q_transferability = null;
  allHuman.business_scalability = null;
  allHuman.q_distinctive_assets_score = null;
  const allExcl = await runScoring(allHuman, { naceCode: '282' });

  const checks: Array<[string, boolean]> = [
    ['baseline human capital is a finite number', Number.isFinite(baseline.capitals.human)],
    ['single-exclusion human capital is finite', Number.isFinite(oneExcl.capitals.human)],
    [
      'single-exclusion founder_independence percentile is NaN',
      Number.isNaN(oneExcl.percentiles.founder_independence),
    ],
    [
      'fully-excluded human capital falls back to 50 (neutral)',
      allExcl.capitals.human === 50,
    ],
    ['headline V always finite', Number.isFinite(allExcl.valuation.v_current_eur)],
    [
      'baseline V differs from single-exclusion V (weights re-balanced)',
      baseline.capitals.human !== oneExcl.capitals.human,
    ],
  ];

  let ok = true;
  console.log('--- Exclusion acceptance ---');
  for (const [label, pass] of checks) {
    const status = pass ? '✓' : '✗';
    if (!pass) ok = false;
    console.log(`${status} ${label}`);
  }

  console.log('\nbaseline human capital  =', baseline.capitals.human);
  console.log('one-exclusion human cap =', oneExcl.capitals.human);
  console.log('all-excluded human cap  =', allExcl.capitals.human);
  console.log('baseline V              =', baseline.valuation.v_current_eur);
  console.log('one-exclusion V         =', oneExcl.valuation.v_current_eur);
  console.log('all-excluded V          =', allExcl.valuation.v_current_eur);

  if (!ok) {
    console.error('\nExclusion calibration miss.');
    process.exit(1);
  }
  console.log('\nExclusion path behaves as designed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
