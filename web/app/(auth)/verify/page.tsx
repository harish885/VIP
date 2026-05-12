import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { Mail } from 'lucide-react';

export const metadata = { title: 'Check your email' };

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { email?: string; mode?: string };
}) {
  const email = searchParams.email ?? 'your inbox';
  const isMagic = searchParams.mode === 'magic';

  return (
    <AuthCard
      eyebrow={isMagic ? '— magic link sent —' : '— almost there —'}
      title={isMagic ? 'Check your inbox.' : 'Confirm your email.'}
      accent={isMagic ? 'inbox.' : 'email.'}
      lead={
        isMagic
          ? `We sent a sign-in link to ${email}. Click it to land in your dashboard. The link works once and expires in an hour.`
          : `We sent a confirmation link to ${email}. Click it to activate your account, then come back to sign in.`
      }
      footer={
        <>
          Used the wrong address?{' '}
          <Link href="/signup" className="font-semibold text-gold hover:underline">
            Start over
          </Link>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/[0.12] text-gold">
          <Mail size={28} strokeWidth={1.75} />
        </div>
        <p className="text-[13px] leading-relaxed text-text-dim">
          Don&rsquo;t see it? Check your spam folder.<br />
          The email can take up to a minute to arrive.
        </p>
      </div>
    </AuthCard>
  );
}
