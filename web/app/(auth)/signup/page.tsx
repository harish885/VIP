import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata = { title: 'Create your account' };

export default function SignupPage() {
  return (
    <AuthCard
      eyebrow="— get started —"
      title="Estimate what your company is worth today."
      accent="worth today."
      lead="A 5-minute diagnostic. No credit card. Your data is yours — RLS-scoped to your account."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-gold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
