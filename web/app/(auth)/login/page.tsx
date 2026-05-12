import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = { title: 'Sign in' };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <AuthCard
      eyebrow="— sign in —"
      title="Welcome back."
      accent="back."
      lead="Pick up where you left off — your dashboard, your scores, your action plan."
      footer={
        <>
          New to VIP?{' '}
          <Link href="/signup" className="font-semibold text-gold hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={searchParams.next} />
    </AuthCard>
  );
}
