import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/service';
import { getCompanySnapshot } from '@/lib/aida';
import { DiagnosticV2Form } from '@/components/diagnostic/diagnostic-v2-form';

export const metadata = { title: 'Run diagnostic · VIP' };
export const dynamic = 'force-dynamic';

export default async function CompanyDiagnosticPage({
  params,
}: {
  params: { taxCode: string };
}) {
  const taxCode = decodeURIComponent(params.taxCode);
  const service = createServiceClient();
  const snapshot = await getCompanySnapshot(service, taxCode);
  if (!snapshot) notFound();

  return <DiagnosticV2Form taxCode={taxCode} companyName={snapshot.company_name} />;
}
