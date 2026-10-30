import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useApiFieldErrors } from '@/hooks/useApiFieldErrors';
import type { ApiError } from '@/lib/api-error';

import { type RegisterInput, registerSchema } from '../auth.schemas';

const registerFields = ['name', 'email', 'role', 'password', 'termsAccepted'] as const;

export function useRegisterForm(
  onSubmit: (input: RegisterInput) => void,
  apiError: ApiError | null,
) {
  const { register, handleSubmit, setError, control, formState } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', termsAccepted: false },
  });

  const formError = useApiFieldErrors(apiError, registerFields, setError);

  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return {
    register,
    errors: formState.errors,
    submit,
    formError,
    password: useWatch({ control, name: 'password' }),
    role: useWatch({ control, name: 'role' }),
  };
}
