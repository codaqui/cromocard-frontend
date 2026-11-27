import { useId } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { Button } from '@/components/Button/Button';
import { FormError } from '@/components/FormError/FormError';
import { Icon } from '@/components/Icon/Icon';
import { Modal } from '@/components/Modal/Modal';
import { Textarea } from '@/components/Textarea/Textarea';
import { TextField } from '@/components/TextField/TextField';
import type { ApiError } from '@/lib/api-error';

import { type CreateListingForm, useCreateListingForm } from '../../hooks/useCreateListingForm';
import type { CreateListingInput } from '../../listings.schemas';
import type { CardCondition, CardOption } from '../../listings.types';
import { CardCatalogPicker } from '../CardCatalogPicker/CardCatalogPicker';
import { ConditionChips } from '../ConditionChips/ConditionChips';
import { ListingFeeSummary } from '../ListingFeeSummary/ListingFeeSummary';
import { ListingPhotosField } from '../ListingPhotosField/ListingPhotosField';
import styles from './CreateListingModal.module.css';

export interface CreateListingModalProps {
  initialCard: CardOption | null;
  conditions: CardCondition[];
  isSubmitting: boolean;
  apiError: ApiError | null;
  onClose: () => void;
  onSubmit: (input: CreateListingInput) => void;
}

function CardAndPhotos({ form }: { form: CreateListingForm }) {
  return (
    <>
      <CardCatalogPicker
        value={form.card}
        onChange={form.chooseCard}
        error={form.errors.cardId?.message}
      />
      <Controller
        control={form.control}
        name="photoUrls"
        render={({ field }) => <ListingPhotosField value={field.value} onChange={field.onChange} />}
      />
    </>
  );
}

function ConditionField({ form, options }: { form: CreateListingForm; options: CardCondition[] }) {
  return (
    <Controller
      control={form.control}
      name="conditionId"
      render={({ field, fieldState }) => (
        <ConditionChips
          options={options}
          value={field.value}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

function PriceFee({ form }: { form: CreateListingForm }) {
  const price = useWatch({ control: form.control, name: 'price' });
  return <ListingFeeSummary price={price} />;
}

function PriceAndQuantity({ form }: { form: CreateListingForm }) {
  return (
    <div className={styles.grid}>
      <div className={styles.priceColumn}>
        <TextField
          label="Preço de Venda (R$)"
          plainLabel
          inputMode="decimal"
          placeholder="0,00"
          error={form.errors.price?.message}
          {...form.register('price')}
        />
        <PriceFee form={form} />
      </div>
      <TextField
        label="Quantidade Disponível"
        plainLabel
        inputMode="numeric"
        error={form.errors.availableQuantity?.message}
        {...form.register('availableQuantity')}
      />
    </div>
  );
}

function ListingFields({
  form,
  conditions,
}: {
  form: CreateListingForm;
  conditions: CardCondition[];
}) {
  return (
    <>
      <CardAndPhotos form={form} />
      <ConditionField form={form} options={conditions} />
      <PriceAndQuantity form={form} />
      <Textarea
        label="Descrição do Anúncio"
        plainLabel
        rows={2}
        error={form.errors.description?.message}
        {...form.register('description')}
      />
      <FormError message={form.formError} />
    </>
  );
}

function ModalActions({
  formId,
  isSubmitting,
  onClose,
}: {
  formId: string;
  isSubmitting: boolean;
  onClose: () => void;
}) {
  return (
    <div className={styles.footer}>
      <Button variant="secondary" disabled={isSubmitting} onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" form={formId} disabled={isSubmitting} aria-busy={isSubmitting}>
        <Icon name="upload" size={18} />
        {isSubmitting ? 'Publicando…' : 'Publicar anúncio'}
      </Button>
    </div>
  );
}

export function CreateListingModal({ initialCard, conditions, ...props }: CreateListingModalProps) {
  const formId = useId();
  const form = useCreateListingForm(initialCard, props.onSubmit, props.apiError);

  return (
    <Modal
      open
      title="Criar anúncio"
      subtitle="Escolha a carta no catálogo e informe a condição, o preço e as fotos."
      icon="addCircle"
      size="form"
      variant="framed"
      dismissible={!props.isSubmitting}
      onClose={props.onClose}
      footer={
        <ModalActions formId={formId} isSubmitting={props.isSubmitting} onClose={props.onClose} />
      }
    >
      <form id={formId} className={styles.form} noValidate onSubmit={form.submit}>
        <ListingFields form={form} conditions={conditions} />
      </form>
    </Modal>
  );
}
