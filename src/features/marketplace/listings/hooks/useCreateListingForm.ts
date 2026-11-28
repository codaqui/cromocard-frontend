import { zodResolver } from '@hookform/resolvers/zod';
import { type FormEvent, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useApiFieldErrors } from '@/hooks/useApiFieldErrors';
import type { ApiError } from '@/lib/api-error';

import {
  type CreateListingFormValues,
  type CreateListingInput,
  createListingSchema,
  emptyListingForm,
} from '../listings.schemas';
import type { CardOption } from '../listings.types';

const listingFormFields = [
  'cardId',
  'conditionId',
  'price',
  'availableQuantity',
  'description',
  'photoUrls',
] as const;

export function useCreateListingForm(
  initialCard: CardOption | null,
  onSubmit: (input: CreateListingInput) => void,
  apiError: ApiError | null,
) {
  const [card, setCard] = useState(initialCard);
  const form = useForm<CreateListingFormValues, unknown, CreateListingInput>({
    resolver: zodResolver(createListingSchema),
    defaultValues: emptyListingForm(initialCard?.id),
  });
  const formError = useApiFieldErrors(apiError, listingFormFields, form.setError);

  const chooseCard = (chosen: CardOption | null) => {
    setCard(chosen);
    form.setValue('cardId', chosen?.id ?? '', { shouldValidate: form.formState.isSubmitted });
  };

  return {
    card,
    chooseCard,
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
    formError,
    submit: (event: FormEvent) => void form.handleSubmit(onSubmit)(event),
  };
}

export type CreateListingForm = ReturnType<typeof useCreateListingForm>;
