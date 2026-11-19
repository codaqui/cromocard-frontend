import { type ReactNode, useId } from 'react';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';

import { describedByOf } from '@/components/FormField/field-ids';
import { FormError } from '@/components/FormError/FormError';
import { FormField } from '@/components/FormField/FormField';
import type { ApiError } from '@/lib/api-error';

import { formatAlbumNumber } from '../../catalog.format';
import { CARD_IMAGE_MIN_SIZE, formatImageSize } from '../../catalog.image';
import { EMPTY_VALUE_LABEL } from '../../catalog.labels';
import type { CardFormValues, CardInput } from '../../catalog.schemas';
import type { Card } from '../../catalog.types';
import { useCardForm } from '../../hooks/useCardForm';
import {
  optionOfAlbum,
  optionOfReference,
  useAlbumOptions,
  useAlbumTotal,
  useCategoryOptions,
  useLanguageOptions,
  useRarityOptions,
} from '../../hooks/useCatalogFilterOptions';
import { DescriptionField, IconInput, IconSelect, WideRow } from '../CatalogFields/CatalogFields';
import type { ReportInvalid } from '../CatalogFormModal/CatalogFormModal';
import { CatalogFormPanel } from '../CatalogFormPanel/CatalogFormPanel';
import { ImageUploadController } from '../ImageUploadController/ImageUploadController';
import styles from './CardForm.module.css';

const SELECT_PLACEHOLDER = 'Selecione';

interface CardFormProps {
  formId: string;
  card?: Card;
  apiError: ApiError | null;
  onSubmit: (input: CardInput) => void;
  onInvalidChange?: ReportInvalid;
}

interface CardFieldsProps {
  register: UseFormRegister<CardFormValues>;
  errors: FieldErrors<CardFormValues>;
}

function AlbumTotal({ total }: { total?: number }) {
  return (
    <span className={styles.total} aria-label="Total de cartas do álbum">
      {total === undefined ? EMPTY_VALUE_LABEL : formatAlbumNumber(String(total))}
    </span>
  );
}

/** "004 / 102": o número da carta e o total do álbum escolhido, como no frame 278-3246. */
function NumberingField({ register, errors, total }: CardFieldsProps & { total?: number }) {
  const inputId = useId();
  const error = errors.number?.message;

  return (
    <FormField inputId={inputId} label="Numeração" error={error}>
      <div className={styles.numbering}>
        <input
          id={inputId}
          className={styles.numberInput}
          aria-invalid={Boolean(error)}
          aria-describedby={describedByOf(inputId, { error })}
          {...register('number')}
        />
        <span aria-hidden="true">/</span>
        <AlbumTotal total={total} />
      </div>
    </FormField>
  );
}

function ClassificationFields({ register, errors, card }: CardFieldsProps & { card?: Card }) {
  return (
    <>
      <IconSelect
        label="Raridade"
        required
        placeholder={SELECT_PLACEHOLDER}
        options={useRarityOptions(optionOfReference(card?.rarity))}
        error={errors.rarityId?.message}
        {...register('rarityId')}
      />
      <IconSelect
        label="Idioma"
        required
        placeholder={SELECT_PLACEHOLDER}
        options={useLanguageOptions(optionOfReference(card?.language))}
        error={errors.languageId?.message}
        {...register('languageId')}
      />
    </>
  );
}

function NameField({ register, errors }: CardFieldsProps) {
  return (
    <WideRow>
      <IconInput
        label="Nome da carta"
        required
        showValid
        placeholder="Ex.: Charizard"
        error={errors.name?.message}
        {...register('name')}
      />
    </WideRow>
  );
}

function PairRow({ children }: { children: ReactNode }) {
  return (
    <WideRow>
      <div className={styles.pair}>{children}</div>
    </WideRow>
  );
}

/** "Ano de lançamento" é da CCD106: aparece desabilitado até lá (CCD105, L12). */
function ReleaseYearField() {
  return (
    <IconInput label="Ano de lançamento" icon="calendar" iconEnd disabled placeholder="AAAA" />
  );
}

function IdentityFields({ register, errors, card }: CardFieldsProps & { card?: Card }) {
  return (
    <>
      <NameField register={register} errors={errors} />
      <PairRow>
        <IconSelect
          label="Franquia"
          required
          placeholder={SELECT_PLACEHOLDER}
          options={useCategoryOptions('CARD', optionOfReference(card?.category))}
          error={errors.categoryId?.message}
          {...register('categoryId')}
        />
        <ReleaseYearField />
      </PairRow>
    </>
  );
}

function CodeFields({ register, errors }: CardFieldsProps) {
  return (
    <PairRow>
      <IconInput
        label="Código"
        placeholder="Ex.: CRD-POK-0005"
        error={errors.code?.message}
        {...register('code')}
      />
      <IconInput
        label="Variantes"
        placeholder="Ex.: Shadowless, Holofoil"
        error={errors.variants?.message}
        {...register('variants')}
      />
    </PairRow>
  );
}

function AlbumField({ register, errors, card }: CardFieldsProps & { card?: Card }) {
  return (
    <WideRow>
      <IconSelect
        label="Álbum"
        icon="menuBook"
        placeholder="Sem álbum (carta avulsa)"
        options={useAlbumOptions(optionOfAlbum(card?.album))}
        error={errors.albumId?.message}
        {...register('albumId')}
      />
    </WideRow>
  );
}

type CardFormState = ReturnType<typeof useCardForm>;

function CardDataPanel({ form, card }: { form: CardFormState; card?: Card }) {
  const { register, errors } = form;
  const total = useAlbumTotal(form.albumId, card?.album);

  return (
    <CatalogFormPanel icon="shield" title="Dados da carta">
      <div className={styles.fields}>
        <IdentityFields register={register} errors={errors} card={card} />
        <CodeFields register={register} errors={errors} />
        <AlbumField register={register} errors={errors} card={card} />
        <NumberingField register={register} errors={errors} total={total} />
        <ClassificationFields register={register} errors={errors} card={card} />
        <DescriptionField error={errors.description?.message} {...register('description')} />
      </div>
    </CatalogFormPanel>
  );
}

function CardImagesPanel({ control }: { control: Control<CardFormValues, unknown, CardInput> }) {
  const minimum = `Mín. ${formatImageSize(CARD_IMAGE_MIN_SIZE)}`;

  return (
    <CatalogFormPanel icon="image" title="Imagens" aside={minimum}>
      <ImageUploadController
        control={control}
        name="frontImageUrl"
        label="Imagem da frente"
        folder="cards"
        required
        minSize={CARD_IMAGE_MIN_SIZE}
      />
      <ImageUploadController
        control={control}
        name="backImageUrl"
        label="Imagem do verso"
        folder="cards"
        minSize={CARD_IMAGE_MIN_SIZE}
        compact
      />
    </CatalogFormPanel>
  );
}

export function CardForm({ formId, card, apiError, onSubmit, onInvalidChange }: CardFormProps) {
  const form = useCardForm({ item: card, onSubmit, apiError, onInvalidChange });

  return (
    <form id={formId} className={styles.form} noValidate onSubmit={form.submit}>
      <CardDataPanel form={form} card={card} />
      <CardImagesPanel control={form.control} />
      <div className={styles.formError}>
        <FormError message={form.formError} />
      </div>
    </form>
  );
}
