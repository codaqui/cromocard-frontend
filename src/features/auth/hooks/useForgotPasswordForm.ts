import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { type ForgotPasswordInput, forgotPasswordSchema } from '../auth.schemas';

export function useForgotPasswordForm(onSubmit: (input: ForgotPasswordInput) => void) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return { register, errors: formState.errors, submit };
}
