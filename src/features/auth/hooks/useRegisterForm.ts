import { zodResolver } from '@hookform/resolvers/zod';
import { type FormEvent, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import type { ApiError } from '@/lib/api-error';

import { type RegisterInput, registerSchema } from '../auth.schemas';

const registerFields: (keyof RegisterInput)[] = ['name', 'email', 'role', 'password'];

function isRegisterField(field: string): field is keyof RegisterInput {
  return registerFields.includes(field as keyof RegisterInput);
}

export function useRegisterForm(
  onSubmit: (input: RegisterInput) => void,
  apiError: ApiError | null,
) {
  const { register, handleSubmit, setError, control, formState } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', termsAccepted: false },
  });

  useEffect(() => {
    apiError?.details
      ?.filter((detail) => isRegisterField(detail.field))
      .forEach(({ field, message }) => setError(field as keyof RegisterInput, { message }));
  }, [apiError, setError]);

  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return {
    register,
    errors: formState.errors,
    submit,
    password: useWatch({ control, name: 'password' }),
    role: useWatch({ control, name: 'role' }),
  };
}
