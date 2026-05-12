'use client';

import { useState, useTransition } from 'react';
import { signInAction, signInWithMagicLinkAction } from '@/app/(auth)/actions';
import {
  Field,
  TextInput,
  PrimaryButton,
  SecondaryButton,
  FormError,
  FormSuccess,
} from '@/components/auth/auth-fields';

export function LoginForm({ next }: { next?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [pendingMagic, startMagicTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await signInAction(formData);
      if (result && !result.ok) setError(result.error);
    });
  }

  async function handleMagic(formData: FormData) {
    setError(null);
    setInfo(null);
    startMagicTransition(async () => {
      const result = await signInWithMagicLinkAction(formData);
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <>
      <FormError message={error} />
      <FormSuccess message={info} />

      <form action={handleSubmit} className="flex flex-col">
        {next && <input type="hidden" name="next" value={next} />}

        <Field label="Email" required>
          <TextInput
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
            disabled={pending || pendingMagic}
          />
        </Field>

        <Field label="Password" required>
          <TextInput
            type="password"
            name="password"
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            disabled={pending || pendingMagic}
          />
        </Field>

        <PrimaryButton type="submit" disabled={pending || pendingMagic}>
          {pending ? 'Signing you in…' : 'Sign in'}
        </PrimaryButton>
      </form>

      <div className="my-5 flex items-center gap-3 text-[10px] font-mono uppercase tracking-eyebrow text-text-faint">
        <div className="h-px flex-1 bg-line-faint" />
        or
        <div className="h-px flex-1 bg-line-faint" />
      </div>

      <form
        action={(formData) => {
          // Reuse the email entered above
          const emailEl = document.getElementById('email') as HTMLInputElement | null;
          if (emailEl?.value) formData.set('email', emailEl.value);
          return handleMagic(formData);
        }}
      >
        <SecondaryButton type="submit" disabled={pending || pendingMagic}>
          {pendingMagic ? 'Sending magic link…' : 'Email me a magic link'}
        </SecondaryButton>
      </form>
    </>
  );
}
