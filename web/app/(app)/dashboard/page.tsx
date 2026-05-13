import { redirect } from 'next/navigation';

/**
 * Legacy /dashboard route.
 *
 * Pre-pivot, this rendered the seeded ACME demo. The product is now
 * company-centric — every dashboard lives under /companies/[taxCode].
 * Forward visitors to the search page.
 */
export default function DashboardLegacyPage() {
  redirect('/companies');
}
