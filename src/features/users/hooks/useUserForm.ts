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

/** Campos que a pessoa mexeu: a edição manda só eles, para não apagar o que o formulário não carregou. */
export type UserFormDirtyFields = Partial<Record<keyof CreateUserFormValues, boolean>>;

export function useUserForm(
  defaultValues: CreateUserFormValues,
  onSubmit: (input: CreateUserInput, dirtyFields: UserFormDirtyFields) => void,
  apiError: ApiError | null,
) {
  const { register, handleSubmit, setError, formState } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues,
  });

  const formError = useApiFieldErrors(apiError, userFormFields, setError);

  // O formState do React Hook Form é um proxy: ler dirtyFields durante a renderização é o que assina as mudanças.
  const { dirtyFields } = formState;
  const submit = (event: FormEvent) =>
    void handleSubmit((input) => onSubmit(input, dirtyFields))(event);

  return { register, errors: formState.errors, submit, formError };
}
