import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useApiFieldErrors } from '@/hooks/useApiFieldErrors';
import type { ApiError } from '@/lib/api-error';

import { type ResetPasswordInput, resetPasswordSchema } from '../auth.schemas';

const resetPasswordFields = ['password'] as const;

export function useResetPasswordForm(
  onSubmit: (input: ResetPasswordInput) => void,
  apiError: ApiError | null,
) {
  const { register, handleSubmit, setError, control, formState } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });
  const formError = useApiFieldErrors(apiError, resetPasswordFields, setError);

  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return {
    register,
    errors: formState.errors,
    submit,
    formError,
    password: useWatch({ control, name: 'password' }),
  };
}
