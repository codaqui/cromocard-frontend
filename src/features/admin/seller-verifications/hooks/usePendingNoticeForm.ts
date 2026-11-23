import { zodResolver } from '@hookform/resolvers/zod';
import { type UseFormReturn, useForm } from 'react-hook-form';

import { deadlineHoursLabels, DEFAULT_DEADLINE_HOURS } from '../seller-verifications.labels';
import {
  type SendPendingNoticeInput,
  sendPendingNoticeSchema,
} from '../seller-verifications.schemas';
import type {
  DeadlineHours,
  PendingNoticeTarget,
  PendingTemplate,
} from '../seller-verifications.types';

interface UsePendingNoticeFormOptions {
  target: PendingNoticeTarget;
  templates: PendingTemplate[];
  onSubmit: (values: SendPendingNoticeInput) => void;
}

type PendingNoticeForm = UseFormReturn<SendPendingNoticeInput>;

export function fillTemplate(
  body: string,
  target: PendingNoticeTarget,
  deadlineHours: DeadlineHours,
): string {
  return body
    .replaceAll('{nome}', target.sellerName)
    .replaceAll('{cnpj}', target.cnpj)
    .replaceAll('{prazo}', deadlineHoursLabels[deadlineHours]);
}

function templateActions(
  { setValue, getValues, formState }: PendingNoticeForm,
  { target, templates }: Omit<UsePendingNoticeFormOptions, 'onSubmit'>,
) {
  const templateOf = (key: string | undefined) => templates.find((item) => item.key === key);
  const fillMessage = (body: string, hours: DeadlineHours) =>
    setValue('message', fillTemplate(body, target, hours), {
      shouldValidate: formState.isSubmitted,
    });

  return {
    selectTemplate: (key: string) => {
      setValue('templateKey', key || undefined);
      const template = templateOf(key);
      if (template) fillMessage(template.body, getValues('deadlineHours'));
    },
    changeDeadline: (hours: DeadlineHours) => {
      const { templateKey, message, deadlineHours } = getValues();
      setValue('deadlineHours', hours);
      const template = templateOf(templateKey);
      const untouched = template && message === fillTemplate(template.body, target, deadlineHours);
      if (untouched) fillMessage(template.body, hours);
    },
  };
}

export function usePendingNoticeForm({ onSubmit, ...context }: UsePendingNoticeFormOptions) {
  const form = useForm<SendPendingNoticeInput>({
    resolver: zodResolver(sendPendingNoticeSchema),
    defaultValues: { templateKey: undefined, message: '', deadlineHours: DEFAULT_DEADLINE_HOURS },
  });

  return {
    messageField: form.register('message'),
    messageError: form.formState.errors.message?.message,
    templateKey: form.watch('templateKey') ?? '',
    deadlineHours: form.watch('deadlineHours'),
    ...templateActions(form, context),
    submit: () => void form.handleSubmit(onSubmit)(),
  };
}

export type PendingNoticeFormState = ReturnType<typeof usePendingNoticeForm>;
