import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { useApiFieldErrors } from '@/hooks/useApiFieldErrors';
import type { ApiError } from '@/lib/api-error';

import {
  type CreateUserFormValues,
  type CreateUserInput,
  createUserSchema,
} from '../users.schemas';

const userFormFields = ['name', 'email', 'role', 'username', 'cpf', 'phone'] as const;

export function useUserForm(
  defaultValues: CreateUserFormValues,
  onSubmit: (input: CreateUserInput) => void,
  apiError: ApiError | null,
) {
  const { register, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues,
  });

  const formError = useApiFieldErrors(apiError, userFormFields, setError);

  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return { register, errors: formState.errors, submit, formError };
}
