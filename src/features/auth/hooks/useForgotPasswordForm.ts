import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { useApiFieldErrors } from '@/hooks/useApiFieldErrors';
import type { ApiError } from '@/lib/api-error';

import { type ForgotPasswordInput, forgotPasswordSchema } from '../auth.schemas';

const forgotPasswordFields = ['email'] as const;

export function useForgotPasswordForm(
  onSubmit: (input: ForgotPasswordInput) => void,
  apiError: ApiError | null,
) {
  const { register, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const formError = useApiFieldErrors(apiError, forgotPasswordFields, setError);

  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return { register, errors: formState.errors, submit, formError };
}
