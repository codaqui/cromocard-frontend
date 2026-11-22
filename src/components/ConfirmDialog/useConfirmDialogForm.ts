import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { REASON_MAX_LENGTH, reasonSchemaUpTo } from '@/lib/reason';
import { z } from '@/lib/zod';

interface ConfirmDialogFormOptions {
  requireReason: boolean;
  reasonRequiredMessage?: string;
  reasonMaxLength?: number;
  confirmationText?: string;
  onConfirm: (reason?: string) => void;
}

const optionalText = z.string().optional();

function matches(expected: string) {
  return z.string().refine((typed) => typed.trim() === expected, {
    error: 'O texto digitado não confere',
  });
}

function requiredReason(maxLength: number, blankMessage?: string) {
  const reason = reasonSchemaUpTo(maxLength);
  if (!blankMessage) return reason;
  return z.string().trim().min(1, { error: blankMessage }).pipe(reason);
}

function buildSchema({
  requireReason,
  reasonRequiredMessage,
  reasonMaxLength = REASON_MAX_LENGTH,
  confirmationText,
}: ConfirmDialogFormOptions) {
  return z.object({
    reason: requireReason ? requiredReason(reasonMaxLength, reasonRequiredMessage) : optionalText,
    confirmation: confirmationText ? matches(confirmationText) : optionalText,
  });
}

export function useConfirmDialogForm(options: ConfirmDialogFormOptions) {
  const { register, handleSubmit, formState, watch } = useForm({
    resolver: zodResolver(buildSchema(options)),
    defaultValues: { reason: '', confirmation: '' },
  });

  const confirm = ({ reason }: { reason?: string }) =>
    options.onConfirm(options.requireReason ? reason : undefined);
  const submit = (event: FormEvent) => void handleSubmit(confirm)(event);
  const confirmationTyped = (watch('confirmation') ?? '').trim().length > 0;
  const confirmationPending = Boolean(options.confirmationText) && !confirmationTyped;

  return { register, errors: formState.errors, submit, confirmationPending };
}
