import { HomeLink } from '@/components/chrome/home-link';

/**
 * Infographic layout — just the shared home button on top so users can
 * always get back to `/`. The page itself is a long client-rendered
 * scroll experience that handles its own background.
 */
export default function InfographicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HomeLink variant="fixed" />
      {children}
    </>
  );
}
