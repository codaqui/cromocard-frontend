import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';

import { FormError } from '@/components/FormError/FormError';
import { Textarea } from '@/components/Textarea/Textarea';
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
import { IconInput, IconSelect, WideRow } from '../CatalogFields/CatalogFields';
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
      icon: 'menuBook',
      placeholder: 'Sem álbum',
      options: useAlbumOptions(optionOfAlbum(card?.album)),
    },
    {
      name: 'categoryId',
      label: 'Categoria',
      icon: 'gamepad',
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
      icon: 'diamond',
      placeholder: 'Sem raridade',
      options: useRarityOptions(),
    },
    {
      name: 'languageId',
      label: 'Idioma',
      icon: 'language',
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
    <IconSelect
      key={select.name}
      label={select.label}
      icon={select.icon}
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
      <IconInput label="Nome" icon="title" error={errors.name?.message} {...register('name')} />
      <IconInput label="Número" icon="tag" error={errors.number?.message} {...register('number')} />
    </>
  );
}

function CardImageFields({ control }: { control: Control<CardFormValues, unknown, CardInput> }) {
  return (
    <>
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
    </>
  );
}

export function CardForm({ formId, card, apiError, onSubmit }: CardFormProps) {
  const { register, control, errors, formError, submit } = useCardForm(card, onSubmit, apiError);

  return (
    <form id={formId} className={styles.form} noValidate onSubmit={submit}>
      <CardDetailsFields register={register} errors={errors} />
      <CardReferenceFields register={register} errors={errors} card={card} />
      <WideRow>
        <Textarea
          label="Descrição"
          error={errors.description?.message}
          {...register('description')}
        />
      </WideRow>
      <CardImageFields control={control} />
      <WideRow>
        <FormError message={formError} />
      </WideRow>
    </form>
  );
}
