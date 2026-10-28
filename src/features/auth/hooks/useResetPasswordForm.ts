import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { type ResetPasswordInput, resetPasswordSchema } from '../auth.schemas';

export function useResetPasswordForm(onSubmit: (input: ResetPasswordInput) => void) {
  const { register, handleSubmit, control, formState } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return {
    register,
    errors: formState.errors,
    submit,
    password: useWatch({ control, name: 'password' }),
  };
}
