import { z } from '@/lib/zod';

import { CATEGORY_TYPES } from './catalog.types';

const SMALLINT_MAX = 32767;
const URL_MAX_LENGTH = 255;

export const ALBUM_TITLE_MAX_LENGTH = 160;
export const ALBUM_PUBLISHER_MAX_LENGTH = 120;
export const CARD_NAME_MAX_LENGTH = 160;
export const CARD_NUMBER_MAX_LENGTH = 20;
export const CATEGORY_NAME_MAX_LENGTH = 90;

const tooLong = (max: number) => `Use no máximo ${max} caracteres`;

const requiredText = (max: number, missing: string) =>
  z
    .string()
    .trim()
    .min(1, { error: missing })
    .max(max, { error: tooLong(max) });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: tooLong(max) })
    .transform((value) => value || null);

const optionalLongText = z
  .string()
  .trim()
  .transform((value) => value || null);

const imageUrl = z.url({ error: 'Envie a imagem' }).max(URL_MAX_LENGTH);

const optionalImageUrl = z
  .string()
  .transform((value) => value || null)
  .pipe(imageUrl.nullable());

const optionalReference = z
  .string()
  .transform((value) => value || null)
  .pipe(z.uuid({ error: 'Selecione uma opção da lista' }).nullable());

const optionalYear = z
  .string()
  .trim()
  .transform((value) => (value ? Number(value) : null))
  .pipe(
    z
      .number({ error: 'Informe o ano com números' })
      .int({ error: 'Informe o ano com números' })
      .min(1, { error: 'Informe um ano válido' })
      .max(SMALLINT_MAX, { error: 'Informe um ano válido' })
      .nullable(),
  );

export const albumFormSchema = z.object({
  title: requiredText(ALBUM_TITLE_MAX_LENGTH, 'Informe o título do álbum'),
  publisher: optionalText(ALBUM_PUBLISHER_MAX_LENGTH),
  year: optionalYear,
  description: optionalLongText,
  coverUrl: optionalImageUrl,
  categoryId: optionalReference,
});

export const cardFormSchema = z.object({
  name: requiredText(CARD_NAME_MAX_LENGTH, 'Informe o nome da carta'),
  number: optionalText(CARD_NUMBER_MAX_LENGTH),
  description: optionalLongText,
  frontImageUrl: imageUrl,
  backImageUrl: optionalImageUrl,
  albumId: optionalReference,
  categoryId: optionalReference,
  rarityId: optionalReference,
  languageId: optionalReference,
});

export const categoryFormSchema = z.object({
  name: requiredText(CATEGORY_NAME_MAX_LENGTH, 'Informe o nome da categoria'),
  type: z.string().pipe(z.enum(CATEGORY_TYPES, { error: 'Escolha o tipo da categoria' })),
  parentCategoryId: optionalReference,
});

export type AlbumFormValues = z.input<typeof albumFormSchema>;
export type AlbumInput = z.output<typeof albumFormSchema>;
export type CardFormValues = z.input<typeof cardFormSchema>;
export type CardInput = z.output<typeof cardFormSchema>;
export type CategoryFormValues = z.input<typeof categoryFormSchema>;
export type CategoryInput = z.output<typeof categoryFormSchema>;
