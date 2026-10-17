import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { type UpdateUserInput, updateUserSchema } from '../users.schemas';

export function useEditNameForm(defaultName: string, onSubmit: (input: UpdateUserInput) => void) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: defaultName },
  });

  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return { register, errors: formState.errors, submit };
}
