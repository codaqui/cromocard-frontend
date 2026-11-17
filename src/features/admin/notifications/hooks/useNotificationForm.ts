import { zodResolver } from '@hookform/resolvers/zod';
import { type FormEvent, useEffect } from 'react';
import { type UseFormSetError, useForm, useWatch } from 'react-hook-form';

import type { ApiError } from '@/lib/api-error';

import { todayInBrasilia } from '../global-notifications.format';
import {
  type NotificationFormValues,
  notificationFormSchema,
} from '../global-notifications.schemas';
import type { DispatchNotificationInput, RecipientsCount } from '../global-notifications.types';

const EMPTY_AUDIENCE_MESSAGE = 'Este público não tem usuários. Escolha outro público.';

/** Campos da API que aparecem no formulário; `scheduledAt` aparece no agendamento. */
const FIELD_OF: Record<string, keyof NotificationFormValues> = {
  title: 'title',
  content: 'content',
  link: 'link',
  channels: 'channels',
  audience: 'audience',
  scheduledAt: 'scheduleDay',
};

export const notificationFormDefaults = (): NotificationFormValues => ({
  title: '',
  content: '',
  link: '',
  audience: 'ALL',
  channels: ['IN_APP'],
  when: 'NOW',
  scheduleDay: todayInBrasilia(),
  scheduleHour: '20',
  scheduleMinute: '30',
});

interface UseNotificationFormOptions {
  counts?: RecipientsCount;
  apiError: ApiError | null;
  onSubmit: (input: DispatchNotificationInput) => void;
}

const isFieldErrorOf = (apiError: ApiError | null) =>
  apiError?.code === 'EMPTY_AUDIENCE' ||
  (apiError?.details ?? []).some(({ field }) => field in FIELD_OF);

/** Mostra no campo certo o erro que a API devolveu (400 com details e 422 EMPTY_AUDIENCE). */
function useApiErrorsOnFields(
  apiError: ApiError | null,
  setError: UseFormSetError<NotificationFormValues>,
) {
  useEffect(() => {
    if (apiError?.code === 'EMPTY_AUDIENCE') setError('audience', { message: apiError.message });
    (apiError?.details ?? []).forEach(({ field, message }) => {
      const formField = FIELD_OF[field];
      if (formField) setError(formField, { message });
    });
  }, [apiError, setError]);
  return apiError && !isFieldErrorOf(apiError) ? apiError.message : undefined;
}

/** Público vazio não envia (CCD101 R8): avisa no campo antes de chamar a API. */
const sendWhenAudienceHasUsers =
  (
    counts: RecipientsCount | undefined,
    setError: UseFormSetError<NotificationFormValues>,
    onSubmit: (input: DispatchNotificationInput) => void,
  ) =>
  (input: DispatchNotificationInput) => {
    if (counts?.[input.audience] === 0) {
      setError('audience', { message: EMPTY_AUDIENCE_MESSAGE });
      return;
    }
    onSubmit(input);
  };

export function useNotificationForm({ counts, apiError, onSubmit }: UseNotificationFormOptions) {
  const form = useForm<NotificationFormValues, unknown, DispatchNotificationInput>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: notificationFormDefaults(),
  });
  const { control, setError, setValue, handleSubmit, reset, formState } = form;
  const formError = useApiErrorsOnFields(apiError, setError);

  const send = sendWhenAudienceHasUsers(counts, setError, onSubmit);

  return {
    register: form.register,
    values: useWatch({ control }) as NotificationFormValues,
    errors: formState.errors,
    hasErrors: Object.keys(formState.errors).length > 0,
    formError,
    setDay: (day: string) =>
      setValue('scheduleDay', day, { shouldValidate: formState.isSubmitted }),
    submit: (event: FormEvent) => void handleSubmit(send)(event),
    clear: () => reset(notificationFormDefaults()),
  };
}

export type NotificationFormState = ReturnType<typeof useNotificationForm>;
