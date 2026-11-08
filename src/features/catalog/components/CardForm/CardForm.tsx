import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { FormError } from '@/components/FormError/FormError';
import { Select } from '@/components/Select/Select';
import { Textarea } from '@/components/Textarea/Textarea';
import { TextField } from '@/components/TextField/TextField';
import type { ApiError } from '@/lib/api-error';

import type { CardFormValues, CardInput } from '../../catalog.schemas';
import type { Card } from '../../catalog.types';
import { useCardForm } from '../../hooks/useCardForm';
import {
  optionOfAlbum,
  optionOfReference,
  useAlbumOptions,
  useCategoryOptions,
  useLanguageOptions,
  useRarityOptions,
} from '../../hooks/useCatalogFilterOptions';
import { ImageUploadController } from '../ImageUploadController/ImageUploadController';
import styles from './CardForm.module.css';

interface CardFormProps {
  formId: string;
  card?: Card;
  apiError: ApiError | null;
  onSubmit: (input: CardInput) => void;
}

interface CardFieldsProps {
  register: UseFormRegister<CardFormValues>;
  errors: FieldErrors<CardFormValues>;
}

function usePlacementSelects(card?: Card) {
  return [
    {
      name: 'albumId',
      label: 'Álbum',
      placeholder: 'Sem álbum',
      options: useAlbumOptions(optionOfAlbum(card?.album)),
    },
    {
      name: 'categoryId',
      label: 'Categoria',
      placeholder: 'Sem categoria',
      options: useCategoryOptions('CARD', optionOfReference(card?.category)),
    },
  ] as const;
}

function useClassificationSelects() {
  return [
    {
      name: 'rarityId',
      label: 'Raridade',
      placeholder: 'Sem raridade',
      options: useRarityOptions(),
    },
    {
      name: 'languageId',
      label: 'Idioma',
      placeholder: 'Sem idioma',
      options: useLanguageOptions(),
    },
  ] as const;
}

function useCardReferenceSelects(card?: Card) {
  return [...usePlacementSelects(card), ...useClassificationSelects()];
}

function CardReferenceFields({ register, errors, card }: CardFieldsProps & { card?: Card }) {
  return useCardReferenceSelects(card).map((select) => (
    <Select
      key={select.name}
      label={select.label}
      placeholder={select.placeholder}
      options={select.options}
      error={errors[select.name]?.message}
      {...register(select.name)}
    />
  ));
}

function CardDetailsFields({ register, errors }: CardFieldsProps) {
  return (
    <>
      <TextField label="Nome" error={errors.name?.message} {...register('name')} />
      <TextField label="Número" error={errors.number?.message} {...register('number')} />
      <Textarea
        label="Descrição"
        error={errors.description?.message}
        {...register('description')}
      />
    </>
  );
}

export function CardForm({ formId, card, apiError, onSubmit }: CardFormProps) {
  const { register, control, errors, formError, submit } = useCardForm(card, onSubmit, apiError);

  return (
    <form id={formId} className={styles.form} noValidate onSubmit={submit}>
      <CardDetailsFields register={register} errors={errors} />
      <CardReferenceFields register={register} errors={errors} card={card} />
      <ImageUploadController
        control={control}
        name="frontImageUrl"
        label="Imagem da frente"
        folder="cards"
      />
      <ImageUploadController
        control={control}
        name="backImageUrl"
        label="Imagem do verso (opcional)"
        folder="cards"
        removable
      />
      <FormError message={formError} />
    </form>
  );
}
