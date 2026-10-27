import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { reasonSchema } from '@/lib/reason';
import { z } from '@/lib/zod';

interface ConfirmDialogFormOptions {
  requireReason: boolean;
  confirmationText?: string;
  onConfirm: (reason?: string) => void;
}

const optionalText = z.string().optional();

function matches(expected: string) {
  return z.string().refine((typed) => typed.trim() === expected, {
    error: 'O texto digitado não confere',
  });
}

function buildSchema({ requireReason, confirmationText }: ConfirmDialogFormOptions) {
  return z.object({
    reason: requireReason ? reasonSchema : optionalText,
    confirmation: confirmationText ? matches(confirmationText) : optionalText,
  });
}

export function useConfirmDialogForm(options: ConfirmDialogFormOptions) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(buildSchema(options)),
    defaultValues: { reason: '', confirmation: '' },
  });

  const confirm = ({ reason }: { reason?: string }) =>
    options.onConfirm(options.requireReason ? reason : undefined);
  const submit = (event: FormEvent) => void handleSubmit(confirm)(event);

  return { register, errors: formState.errors, submit };
}
