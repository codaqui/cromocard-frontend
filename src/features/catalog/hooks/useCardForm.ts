import { zodResolver } from '@hookform/resolvers/zod';
import { type FormEvent, useEffect } from 'react';
import { type UseFormGetValues, type UseFormSetError, useForm, useWatch } from 'react-hook-form';

import { useApiFieldErrors } from '@/hooks/useApiFieldErrors';
import type { ApiError } from '@/lib/api-error';

import { type CardFormValues, type CardInput, cardFormSchema } from '../catalog.schemas';
import type { Card } from '../catalog.types';
import type { CatalogFormOptions } from './catalogFormOptions';
import { useReportInvalid } from './useReportInvalid';

const cardFields = [
  'name',
  'number',
  'description',
  'frontImageUrl',
  'backImageUrl',
  'albumId',
  'categoryId',
  'rarityId',
  'languageId',
] as const;

const NUMBER_TAKEN = 'CARD_NUMBER_TAKEN';

/** A API usa o mesmo código para o número de uma carta excluída, com a mensagem própria. */
export const DELETED_CARD_NUMBER_MESSAGE = 'O número pertence a uma carta excluída deste álbum';

function cardFormDefaults(card?: Card): CardFormValues {
  return {
    name: card?.name ?? '',
    number: card?.number ?? '',
    description: card?.description ?? '',
    frontImageUrl: card?.frontImageUrl ?? '',
    backImageUrl: card?.backImageUrl ?? '',
    albumId: card?.albumId ?? '',
    categoryId: card?.categoryId ?? '',
    rarityId: card?.rarityId ?? '',
    languageId: card?.languageId ?? '',
  };
}

export function numberTakenMessage(apiError: ApiError, number: string): string {
  if (apiError.message === DELETED_CARD_NUMBER_MESSAGE) return apiError.message;
  return `A numeração ${number} já existe neste álbum.`;
}

/** O 409 de número repetido aparece no campo Numeração, como no frame 832-7170. */
function useNumberTakenError(
  apiError: ApiError | null,
  setError: UseFormSetError<CardFormValues>,
  getValues: UseFormGetValues<CardFormValues>,
) {
  useEffect(() => {
    if (apiError?.code !== NUMBER_TAKEN) return;
    setError('number', { message: numberTakenMessage(apiError, getValues('number')) });
  }, [apiError, setError, getValues]);

  return apiError?.code === NUMBER_TAKEN;
}

export function useCardForm({
  item: card,
  onSubmit,
  apiError,
  onInvalidChange,
}: CatalogFormOptions<Card, CardInput>) {
  const { register, control, handleSubmit, setError, getValues, formState } = useForm<
    CardFormValues,
    unknown,
    CardInput
  >({ resolver: zodResolver(cardFormSchema), defaultValues: cardFormDefaults(card) });

  const apiFormError = useApiFieldErrors(apiError, cardFields, setError);
  const isNumberTaken = useNumberTakenError(apiError, setError, getValues);
  useReportInvalid(formState.errors, onInvalidChange);
  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);
  const albumId = useWatch({ control, name: 'albumId' });

  return {
    register,
    control,
    albumId,
    errors: formState.errors,
    formError: isNumberTaken ? undefined : apiFormError,
    submit,
  };
}
