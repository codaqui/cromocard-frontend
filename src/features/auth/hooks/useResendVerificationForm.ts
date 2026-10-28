import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { type ResendVerificationInput, resendVerificationSchema } from '../auth.schemas';

export function useResendVerificationForm(
  defaultEmail: string,
  onSubmit: (input: ResendVerificationInput) => void,
) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: defaultEmail },
  });

  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return { register, errors: formState.errors, submit };
}
