import { zodResolver } from '@hookform/resolvers/zod';
import type { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import { useApiFieldErrors } from '@/hooks/useApiFieldErrors';
import type { ApiError } from '@/lib/api-error';

import { type CardFormValues, type CardInput, cardFormSchema } from '../catalog.schemas';
import type { Card } from '../catalog.types';

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

export function useCardForm(
  card: Card | undefined,
  onSubmit: (input: CardInput) => void,
  apiError: ApiError | null,
) {
  const { register, control, handleSubmit, setError, formState } = useForm<
    CardFormValues,
    unknown,
    CardInput
  >({ resolver: zodResolver(cardFormSchema), defaultValues: cardFormDefaults(card) });

  const formError = useApiFieldErrors(apiError, cardFields, setError);
  const submit = (event: FormEvent) => void handleSubmit(onSubmit)(event);

  return { register, control, errors: formState.errors, formError, submit };
}
