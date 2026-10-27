import { zodResolver } from '@hookform/resolvers/zod';
import { type FormEvent, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import type { ApiError } from '@/lib/api-error';

import { type LoginInput, loginSchema } from '../auth.schemas';

const loginFields: (keyof LoginInput)[] = ['email', 'password', 'rememberMe'];

function isLoginField(field: string): field is keyof LoginInput {
  return loginFields.includes(field as keyof LoginInput);
}

export function useLoginForm(onSubmit: (input: LoginInput) => void, apiError: ApiError | null) {
  const { register, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  useEffect(() => {
    apiError?.details
      ?.filter((detail) => isLoginField(detail.field))
      .forEach(({ field, message }) => setError(field as keyof LoginInput, { message }));
  }, [apiError, setError]);

  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return { register, errors: formState.errors, submit };
}
