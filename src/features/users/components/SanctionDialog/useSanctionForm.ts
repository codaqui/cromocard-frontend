import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { reasonSchema } from '@/lib/reason';
import { z } from '@/lib/zod';

import type { SanctionType } from '../../users.labels';
import { SUSPENSION_DAY_OPTIONS } from '../../users.types';

const sanctionTypeSchema = z.enum(['WARN', 'SUSPEND', 'BLOCK']);
const suspensionDaysSchema = z.union(SUSPENSION_DAY_OPTIONS.map((days) => z.literal(days)));

const sanctionSchema = z.object({
  type: sanctionTypeSchema,
  days: suspensionDaysSchema,
  reason: reasonSchema,
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
