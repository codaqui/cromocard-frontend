import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { reasonSchema } from '@/lib/reason';
import { z } from '@/lib/zod';

const requiredReasonSchema = z.object({ reason: reasonSchema });
const optionalReasonSchema = z.object({ reason: z.string().optional() });

export function useConfirmReasonForm(requireReason: boolean, onConfirm: (reason?: string) => void) {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(requireReason ? requiredReasonSchema : optionalReasonSchema),
    defaultValues: { reason: '' },
  });

  const confirm = ({ reason }: { reason?: string }) =>
    onConfirm(requireReason ? reason : undefined);
  const submit = (event: FormEvent) => void handleSubmit(confirm)(event);

  return { register, errors: formState.errors, submit };
}
