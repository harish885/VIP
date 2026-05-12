import { DashboardView } from '@/components/dashboard/dashboard-view';

export const metadata = { title: 'Dashboard' };

/**
 * /dashboard — the entrepreneur's decision page.
 *
 * Demo mode: renders ACME INDUSTRIE S.R.L. with seeded numbers so the
 * full product surface (KPIs, 4-Capital Radar, Top-3 Actions, Simulation
 * teaser) is visible without auth or a real submission.
 *
 * When real submissions land in Phase 05 + the scoring Edge Function in
 * Phase 06, this page will:
 *   1. Read the user's latest valuation from vip.valuations
 *   2. Pass it into <DashboardView/> via props
 * The view component itself stays unchanged.
 */
export default function DashboardPage() {
  return <DashboardView />;
}
