import { z } from '@/lib/zod';

import { isValidApiPrice, toApiPrice } from './listings.fee';
import { MAX_LISTING_PHOTOS } from './listings.types';

export const INVALID_PRICE_MESSAGE = 'Por favor, insira um valor válido maior que zero';
export const MIN_AVAILABLE_QUANTITY = 1;
export const MAX_AVAILABLE_QUANTITY = 99;
export const MAX_DESCRIPTION_LENGTH = 2000;

const QUANTITY_MESSAGE = `Informe uma quantidade de ${MIN_AVAILABLE_QUANTITY} a ${MAX_AVAILABLE_QUANTITY}`;

const quantitySchema = z
  .string()
  .trim()
  .regex(/^\d+$/, { error: QUANTITY_MESSAGE })
  .transform(Number)
  .pipe(
    z
      .number()
      .int()
      .min(MIN_AVAILABLE_QUANTITY, { error: QUANTITY_MESSAGE })
      .max(MAX_AVAILABLE_QUANTITY, { error: QUANTITY_MESSAGE }),
  );

export const createListingSchema = z.object({
  cardId: z.string().min(1, { error: 'Escolha a carta no catálogo' }),
  conditionId: z.string().min(1, { error: 'Escolha a condição da carta' }),
  price: z.string().transform(toApiPrice).refine(isValidApiPrice, { error: INVALID_PRICE_MESSAGE }),
  availableQuantity: quantitySchema,
  description: z
    .string()
    .trim()
    .max(MAX_DESCRIPTION_LENGTH, {
      error: `A descrição pode ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres`,
    })
    .transform((description) => description || undefined),
  photoUrls: z.array(z.string()).max(MAX_LISTING_PHOTOS),
});

export type CreateListingFormValues = z.input<typeof createListingSchema>;
export type CreateListingInput = z.output<typeof createListingSchema>;

export function emptyListingForm(cardId = ''): CreateListingFormValues {
  return {
    cardId,
    conditionId: '',
    price: '',
    availableQuantity: '1',
    description: '',
    photoUrls: [],
  };
}
