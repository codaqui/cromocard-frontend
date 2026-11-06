import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { FormError } from '@/components/FormError/FormError';
import { Select } from '@/components/Select/Select';
import { Textarea } from '@/components/Textarea/Textarea';
import { TextField } from '@/components/TextField/TextField';

import type { CardFormValues, CardInput } from '../../catalog.schemas';
import type { Card } from '../../catalog.types';
import { useCardForm } from '../../hooks/useCardForm';
import {
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
  errorMessage?: string;
  onSubmit: (input: CardInput) => void;
}

interface CardFieldsProps {
  register: UseFormRegister<CardFormValues>;
  errors: FieldErrors<CardFormValues>;
}

function useCardReferenceSelects() {
  return [
    { name: 'albumId', label: 'Álbum', placeholder: 'Sem álbum', options: useAlbumOptions() },
    {
      name: 'categoryId',
      label: 'Categoria',
      placeholder: 'Sem categoria',
      options: useCategoryOptions('CARD'),
    },
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

function CardReferenceFields({ register, errors }: CardFieldsProps) {
  return useCardReferenceSelects().map((select) => (
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

export function CardForm({ formId, card, errorMessage, onSubmit }: CardFormProps) {
  const { register, control, errors, submit } = useCardForm(card, onSubmit);

  return (
    <form id={formId} className={styles.form} noValidate onSubmit={submit}>
      <CardDetailsFields register={register} errors={errors} />
      <CardReferenceFields register={register} errors={errors} />
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
      />
      <FormError message={errorMessage} />
    </form>
  );
}
