'use client';

import { useState, useTransition } from 'react';
import { signUpAction } from '@/app/(auth)/actions';
import {
  Field,
  TextInput,
  PrimaryButton,
  FormError,
} from '@/components/auth/auth-fields';

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signUpAction(formData);
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <>
      <FormError message={error} />

      <form action={handleSubmit} className="flex flex-col">
        <Field label="Full name">
          <TextInput
            type="text"
            name="full_name"
            autoComplete="name"
            placeholder="Maria Rossi"
            disabled={pending}
          />
        </Field>

        <Field label="Email" required>
          <TextInput
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
            disabled={pending}
          />
        </Field>

        <Field label="Password" hint="At least 8 characters." required>
          <TextInput
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            minLength={8}
            required
            disabled={pending}
          />
        </Field>

        <PrimaryButton type="submit" disabled={pending}>
          {pending ? 'Creating your account…' : 'Create account'}
        </PrimaryButton>
      </form>
    </>
  );
}
