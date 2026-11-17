import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { reasonSchema } from '@/lib/reason';
import { z } from '@/lib/zod';

interface ConfirmDialogFormOptions {
  requireReason: boolean;
  /** Texto do erro quando o motivo obrigatório fica em branco (ex.: frame 847-1380 das solicitações). */
  reasonRequiredMessage?: string;
  confirmationText?: string;
  onConfirm: (reason?: string) => void;
}

const optionalText = z.string().optional();

function matches(expected: string) {
  return z.string().refine((typed) => typed.trim() === expected, {
    error: 'O texto digitado não confere',
  });
}

function requiredReason(blankMessage?: string) {
  if (!blankMessage) return reasonSchema;
  return z.string().trim().min(1, { error: blankMessage }).pipe(reasonSchema);
}

function buildSchema({
  requireReason,
  reasonRequiredMessage,
  confirmationText,
}: ConfirmDialogFormOptions) {
  return z.object({
    reason: requireReason ? requiredReason(reasonRequiredMessage) : optionalText,
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
