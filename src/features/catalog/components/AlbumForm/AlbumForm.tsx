import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';

import { FormError } from '@/components/FormError/FormError';
import { Textarea } from '@/components/Textarea/Textarea';
import type { ApiError } from '@/lib/api-error';

import type { AlbumFormValues, AlbumInput } from '../../catalog.schemas';
import type { Album } from '../../catalog.types';
import { useAlbumForm } from '../../hooks/useAlbumForm';
import { optionOfReference, useCategoryOptions } from '../../hooks/useCatalogFilterOptions';
import { IconInput, IconSelect, WideRow } from '../CatalogFields/CatalogFields';
import { ImageUploadController } from '../ImageUploadController/ImageUploadController';
import styles from './AlbumForm.module.css';

interface AlbumFormProps {
  formId: string;
  album?: Album;
  apiError: ApiError | null;
  onSubmit: (input: AlbumInput) => void;
}

interface AlbumFieldsProps {
  register: UseFormRegister<AlbumFormValues>;
  errors: FieldErrors<AlbumFormValues>;
}

function AlbumDetailsFields({ register, errors }: AlbumFieldsProps) {
  return (
    <>
      <IconInput label="Título" icon="title" error={errors.title?.message} {...register('title')} />
      <IconInput
        label="Editora"
        icon="business"
        error={errors.publisher?.message}
        {...register('publisher')}
      />
      <IconInput
        label="Ano"
        icon="calendar"
        inputMode="numeric"
        error={errors.year?.message}
        {...register('year')}
      />
    </>
  );
}

interface AlbumExtraFieldsProps extends AlbumFieldsProps {
  control: Control<AlbumFormValues, unknown, AlbumInput>;
}

function AlbumExtraFields({ register, errors, control }: AlbumExtraFieldsProps) {
  return (
    <WideRow>
      <Textarea
        label="Descrição"
        error={errors.description?.message}
        {...register('description')}
      />
      <ImageUploadController
        control={control}
        name="coverUrl"
        label="Capa (opcional)"
        folder="albums"
        removable
      />
    </WideRow>
  );
}

export function AlbumForm({ formId, album, apiError, onSubmit }: AlbumFormProps) {
  const { register, control, errors, formError, submit } = useAlbumForm(album, onSubmit, apiError);
  const categoryOptions = useCategoryOptions('ALBUM', optionOfReference(album?.category));

  return (
    <form id={formId} className={styles.form} noValidate onSubmit={submit}>
      <AlbumDetailsFields register={register} errors={errors} />
      <IconSelect
        label="Categoria"
        icon="gamepad"
        placeholder="Sem categoria"
        options={categoryOptions}
        error={errors.categoryId?.message}
        {...register('categoryId')}
      />
      <AlbumExtraFields register={register} errors={errors} control={control} />
      <WideRow>
        <FormError message={formError} />
      </WideRow>
    </form>
  );
}
