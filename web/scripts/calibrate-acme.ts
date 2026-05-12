/**
 * Phase 06 acceptance smoke test.
 *
 * Runs the scoring pipeline against the ACME example profile (synthetic
 * fallback only — no Supabase) and asserts each headline number lands
 * within ±10% of the values seeded in `lib/demo-data.ts`.
 *
 *   V ≈ 4_200_000           SQF ≈ 1.05      GF ≈ 1.07
 *   Quality ≈ 67            Risk = MEDIUM
 *
 * Run with:
 *   npx tsx scripts/calibrate-acme.ts
 *
 * Exits 1 on calibration miss so the script can be wired into CI later.
 */
import { EXAMPLE_DIAGNOSTIC } from '../lib/diagnostic-schema';
import { DEMO_VALUATION } from '../lib/demo-data';
import { runScoring } from '../lib/scoring';

async function main() {
  const result = await runScoring(EXAMPLE_DIAGNOSTIC, { naceCode: '282' });

  const tolerance = (actual: number, expected: number, pct: number) => {
    const diff = Math.abs(actual - expected) / Math.max(1, expected);
    return diff <= pct;
  };

  const checks: Array<[string, number, number, number]> = [
    ['V_current',  result.valuation.v_current_eur, DEMO_VALUATION.v_current_eur, 0.10],
    ['SQF',        result.composite.sqf,           DEMO_VALUATION.sqf,           0.10],
    ['GF',         result.growth.gf,               DEMO_VALUATION.gf,            0.10],
    ['Quality',    result.quality_score,           DEMO_VALUATION.quality_score, 0.10],
    ['M_sector',   result.valuation.m_sector,      DEMO_VALUATION.m_sector,      0.10],
  ];

  let allOk = true;
  console.log('--- ACME calibration ---');
  for (const [name, actual, expected, tol] of checks) {
    const ok = tolerance(actual, expected, tol);
    allOk = allOk && ok;
    const status = ok ? '✓' : '✗';
    console.log(
      `${status} ${name.padEnd(10)}  actual=${actual}  expected=${expected}  (±${(tol * 100).toFixed(0)}%)`,
    );
  }
  const riskOk = result.risk_index === DEMO_VALUATION.risk_index;
  allOk = allOk && riskOk;
  console.log(
    `${riskOk ? '✓' : '✗'} Risk      actual=${result.risk_index}  expected=${DEMO_VALUATION.risk_index}`,
  );

  console.log('\nCapitals:', result.capitals);
  console.log('Flags:', result.flags);
  console.log('Percentiles:', result.percentiles);

  if (!allOk) {
    console.error('\nCalibration miss. Tune weights in lib/scoring/.');
    process.exit(1);
  }
  console.log('\nAll headline numbers within tolerance.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
