import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Fraunces } from 'next/font/google';
import './globals.css';

// =================================================================
// FONTS — wired to CSS variables consumed by Tailwind
// =================================================================
const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const serif = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// =================================================================
// METADATA
// =================================================================
export const metadata: Metadata = {
  metadataBase: new URL('https://vip.local'),
  title: {
    default: 'VIP — Value Intelligence Platform',
    template: '%s · VIP',
  },
  description:
    'A digital decision assistant for SME entrepreneurs. Estimate company value, score strategic quality across four capitals, identify drivers, and surface the actions that grow value.',
  applicationName: 'VIP',
  authors: [{ name: 'VIP Team · Cattolica' }],
  keywords: [
    'SME valuation',
    'value intelligence',
    'enterprise value',
    'four-capital model',
    'strategic quality',
    'Italian SMEs',
  ],
  openGraph: {
    title: 'VIP — Value Intelligence Platform',
    description:
      'What is my company worth today, what drives that value, and which actions could grow it over time?',
    type: 'website',
    siteName: 'VIP',
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#05070d',
  width: 'device-width',
  initialScale: 1,
};

// =================================================================
// ROOT LAYOUT — minimal · just fonts + body shell
//
// Route groups own their own chrome:
//   - (marketing) → particles, scroll progress, side nav, marketing top bar
//   - (auth)      → centered card, just the brand mark
//   - (app)       → app top bar with user menu
// =================================================================
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="bg-bg text-text font-sans antialiased">{children}</body>
    </html>
  );
}
