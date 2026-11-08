import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { FormError } from '@/components/FormError/FormError';
import { Select } from '@/components/Select/Select';
import { Textarea } from '@/components/Textarea/Textarea';
import { TextField } from '@/components/TextField/TextField';
import type { ApiError } from '@/lib/api-error';

import type { AlbumFormValues, AlbumInput } from '../../catalog.schemas';
import type { Album } from '../../catalog.types';
import { useAlbumForm } from '../../hooks/useAlbumForm';
import { optionOfReference, useCategoryOptions } from '../../hooks/useCatalogFilterOptions';
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
      <TextField label="Título" error={errors.title?.message} {...register('title')} />
      <TextField label="Editora" error={errors.publisher?.message} {...register('publisher')} />
      <TextField
        label="Ano"
        inputMode="numeric"
        error={errors.year?.message}
        {...register('year')}
      />
      <Textarea
        label="Descrição"
        error={errors.description?.message}
        {...register('description')}
      />
    </>
  );
}

export function AlbumForm({ formId, album, apiError, onSubmit }: AlbumFormProps) {
  const { register, control, errors, formError, submit } = useAlbumForm(album, onSubmit, apiError);
  const categoryOptions = useCategoryOptions('ALBUM', optionOfReference(album?.category));

  return (
    <form id={formId} className={styles.form} noValidate onSubmit={submit}>
      <AlbumDetailsFields register={register} errors={errors} />
      <Select
        label="Categoria"
        placeholder="Sem categoria"
        options={categoryOptions}
        error={errors.categoryId?.message}
        {...register('categoryId')}
      />
      <ImageUploadController
        control={control}
        name="coverUrl"
        label="Capa (opcional)"
        folder="albums"
        removable
      />
      <FormError message={formError} />
    </form>
  );
}
