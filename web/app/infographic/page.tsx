import { redirect } from 'next/navigation';

export const metadata = { title: 'Methodology · VIP' };

export default function InfographicPage() {
  redirect('/method');
}
