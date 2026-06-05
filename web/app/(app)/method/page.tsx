import { redirect } from 'next/navigation';

/**
 * Legacy /method route.
 *
 * The plain-language methodology page and the interactive explainer
 * told the same story twice. /how-it-works (which walks a real AIDA
 * company through the full pipeline) is now the single methodology
 * surface; the per-company math lives in the cockpit's Method tab.
 */
export default function MethodLegacyPage() {
  redirect('/how-it-works');
}
