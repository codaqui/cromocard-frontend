import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { FormError } from '@/components/FormError/FormError';
import type { ApiError } from '@/lib/api-error';

import { albumStatusLabels } from '../../catalog.labels';
import type { AlbumFormValues, AlbumInput } from '../../catalog.schemas';
import { ALBUM_STATUSES, type Album } from '../../catalog.types';
import { useAlbumForm } from '../../hooks/useAlbumForm';
import { optionOfReference, useCategoryOptions } from '../../hooks/useCatalogFilterOptions';
import { DescriptionField, IconInput, IconSelect, WideRow } from '../CatalogFields/CatalogFields';
import type { ReportInvalid } from '../CatalogFormModal/CatalogFormModal';
import { CatalogFormPanel } from '../CatalogFormPanel/CatalogFormPanel';
import { ImageUploadController } from '../ImageUploadController/ImageUploadController';
import styles from './AlbumForm.module.css';

const statusOptions = ALBUM_STATUSES.map((status) => ({
  value: status,
  label: albumStatusLabels[status],
}));

interface AlbumFormProps {
  formId: string;
  album?: Album;
  apiError: ApiError | null;
  onSubmit: (input: AlbumInput) => void;
  onInvalidChange?: ReportInvalid;
}

interface AlbumFieldsProps {
  register: UseFormRegister<AlbumFormValues>;
  errors: FieldErrors<AlbumFormValues>;
}

function EditionFields({ register, errors, album }: AlbumFieldsProps & { album?: Album }) {
  return (
    <>
      <IconSelect
        label="Franquia"
        placeholder="Selecione"
        options={useCategoryOptions(optionOfReference(album?.category))}
        error={errors.categoryId?.message}
        {...register('categoryId')}
      />
      <IconInput
        label="Ano"
        icon="calendar"
        iconEnd
        inputMode="numeric"
        error={errors.year?.message}
        {...register('year')}
      />
    </>
  );
}

function PublisherFields({ register, errors }: AlbumFieldsProps) {
  return (
    <>
      <IconInput label="Editora" error={errors.publisher?.message} {...register('publisher')} />
      <IconSelect
        label="Status"
        placeholder="Selecione"
        options={statusOptions}
        error={errors.status?.message}
        {...register('status')}
      />
    </>
  );
}

/** "Dados do álbum", como no frame 833-9661. */
function AlbumDataPanel({ register, errors, album }: AlbumFieldsProps & { album?: Album }) {
  return (
    <CatalogFormPanel icon="shield" title="Dados do álbum">
      <div className={styles.fields}>
        <WideRow>
          <IconInput
            label="Título"
            required
            showValid
            error={errors.title?.message}
            {...register('title')}
          />
        </WideRow>
        <EditionFields register={register} errors={errors} album={album} />
        <PublisherFields register={register} errors={errors} />
        <DescriptionField error={errors.description?.message} {...register('description')} />
      </div>
    </CatalogFormPanel>
  );
}

export function AlbumForm({ formId, album, apiError, onSubmit, onInvalidChange }: AlbumFormProps) {
  const form = useAlbumForm({ item: album, onSubmit, apiError, onInvalidChange });

  return (
    <form id={formId} className={styles.form} noValidate onSubmit={form.submit}>
      <AlbumDataPanel register={form.register} errors={form.errors} album={album} />
      <CatalogFormPanel icon="image" title="Capa">
        <ImageUploadController
          control={form.control}
          name="coverUrl"
          label="Capa do álbum"
          folder="albums"
        />
      </CatalogFormPanel>
      <div className={styles.formError}>
        <FormError message={form.formError} />
      </div>
    </form>
  );
}
