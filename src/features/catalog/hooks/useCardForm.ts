import { zodResolver } from '@hookform/resolvers/zod';
import { type ChangeEvent, type FormEvent, useEffect } from 'react';
import {
  type UseFormGetValues,
  type UseFormSetError,
  type UseFormReturn,
  useForm,
  useWatch,
} from 'react-hook-form';

import { useApiFieldErrors } from '@/hooks/useApiFieldErrors';
import type { ApiError } from '@/lib/api-error';

import { type CardFormValues, type CardInput, cardFormSchema } from '../catalog.schemas';
import type { Card } from '../catalog.types';
import type { CatalogFormOptions } from './catalogFormOptions';
import { useAlbumCategoryOf } from './useCatalogFilterOptions';
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

/** Escolher o álbum preenche a franquia dele, que a carta precisa ter (L11). */
function useAlbumField(
  {
    register,
    setValue,
    control,
  }: Pick<UseFormReturn<CardFormValues, unknown, CardInput>, 'register' | 'setValue' | 'control'>,
  card?: Card,
) {
  const categoryOfAlbum = useAlbumCategoryOf(card);
  const fillAlbumCategory = (event: ChangeEvent<HTMLSelectElement>) => {
    const categoryId = categoryOfAlbum(event.target.value);
    if (categoryId) setValue('categoryId', categoryId, { shouldValidate: true });
  };
  const albumField = register('albumId', { onChange: fillAlbumCategory });
  const albumId = useWatch({ control, name: 'albumId' });
  return { albumField, albumId };
}

export function useCardForm({
  item: card,
  onSubmit,
  apiError,
  onInvalidChange,
}: CatalogFormOptions<Card, CardInput>) {
  const { register, control, handleSubmit, setError, getValues, setValue, formState } = useForm<
    CardFormValues,
    unknown,
    CardInput
  >({ resolver: zodResolver(cardFormSchema), defaultValues: cardFormDefaults(card) });

  const apiFormError = useApiFieldErrors(apiError, cardFields, setError);
  const isNumberTaken = useNumberTakenError(apiError, setError, getValues);
  useReportInvalid(formState.errors, onInvalidChange);
  const album = useAlbumField({ register, setValue, control }, card);
  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return {
    register,
    ...album,
    control,
    errors: formState.errors,
    formError: isNumberTaken ? undefined : apiFormError,
    submit,
  };
}
