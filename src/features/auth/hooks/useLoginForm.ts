import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { useApiFieldErrors } from '@/hooks/useApiFieldErrors';
import type { ApiError } from '@/lib/api-error';

import { type LoginInput, loginSchema } from '../auth.schemas';

const loginFields = ['email', 'password', 'rememberMe'] as const;

export function useLoginForm(onSubmit: (input: LoginInput) => void, apiError: ApiError | null) {
  const { register, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });
  const formError = useApiFieldErrors(apiError, loginFields, setError);

  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return { register, errors: formState.errors, submit, formError };
}
