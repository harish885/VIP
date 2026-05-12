import { redirect } from 'next/navigation';

/**
 * Legacy free-form /diagnostic route.
 *
 * The pivot moved every diagnostic to a per-company flow keyed on AIDA
 * tax_code (see /companies and /companies/[taxCode]/diagnostic). There's
 * no longer a way to "score" without first picking a company — forward
 * to the search page.
 */
export default function DiagnosticIndexPage() {
  redirect('/companies');
}
