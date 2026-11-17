import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { reasonSchema, WARNING_REASON_MAX_LENGTH } from '@/lib/reason';
import { z } from '@/lib/zod';

import type { SanctionType } from '../../users.labels';
import { SUSPENSION_DAY_OPTIONS } from '../../users.types';

const sanctionTypeSchema = z.enum(['WARN', 'SUSPEND', 'BLOCK']);
const suspensionDaysSchema = z.union(SUSPENSION_DAY_OPTIONS.map((days) => z.literal(days)));

const sanctionSchema = z
  .object({
    type: sanctionTypeSchema,
    days: suspensionDaysSchema,
    reason: reasonSchema,
  })
  .refine(({ type, reason }) => type !== 'WARN' || reason.length <= WARNING_REASON_MAX_LENGTH, {
    path: ['reason'],
    error: `A justificativa da advertência pode ter no máximo ${WARNING_REASON_MAX_LENGTH} caracteres`,
  });

export type SanctionFormValues = z.infer<typeof sanctionSchema>;

interface UseSanctionFormOptions {
  onSubmit: (values: SanctionFormValues) => void;
}

export function useSanctionForm({ onSubmit }: UseSanctionFormOptions) {
  const { register, handleSubmit, watch, setValue, formState } = useForm<SanctionFormValues>({
    resolver: zodResolver(sanctionSchema),
    defaultValues: { type: 'SUSPEND', days: 7, reason: '' },
  });

  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);
  const setType = (type: SanctionType) => setValue('type', type);
  const setDays = (days: SanctionFormValues['days']) => setValue('days', days);

  return {
    register,
    errors: formState.errors,
    type: watch('type'),
    days: watch('days'),
    setType,
    setDays,
    submit,
  };
}
