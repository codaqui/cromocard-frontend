import { type ChangeEvent, useId, useState } from 'react';

import { FileUpload } from '@/components/FileUpload/FileUpload';

import {
  fileNameOfUrl,
  formatImageSize,
  type ImageSize,
  imageMetaOf,
  meetsMinSize,
  readImageSize,
} from '../../catalog.image';
import { useUploadImage } from '../../catalog.queries';
import type { UploadFolder } from '../../catalog.types';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './ImageUploadField.module.css';

const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/webp';
const IMAGE_HINT = 'PNG, JPG ou WEBP até 4 MB';

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

export interface ImageUploadFieldProps {
  label: string;
  folder: UploadFolder;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  required?: boolean;
  /** Tamanho mínimo: abaixo dele a imagem não é enviada (frame 832-7170, "Abaixo do mínimo"). */
  minSize?: ImageSize;
  /** Linha compacta, como a imagem do verso no Figma. */
  compact?: boolean;
}

interface SelectedImage {
  name: string;
  meta?: string;
  fitsMinSize?: boolean;
}

async function checkImage(file: File, minSize?: ImageSize): Promise<SelectedImage> {
  if (!minSize) return { name: file.name };
  const size = await readImageSize(file);
  return {
    name: file.name,
    meta: imageMetaOf(file, size),
    fitsMinSize: meetsMinSize(size, minSize),
  };
}

function useImageSelection({ folder, minSize, onChange }: ImageUploadFieldProps) {
  const upload = useUploadImage();
  const [selected, setSelected] = useState<SelectedImage | null>(null);

  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const image = await checkImage(file, minSize);
    setSelected(image);
    if (image.fitsMinSize === false) return;
    upload.mutate({ folder, file }, { onSuccess: ({ url }) => onChange(url) });
  };

  return {
    upload,
    selected,
    selectFile: (event: ChangeEvent<HTMLInputElement>) => void selectFile(event),
  };
}

type ImageSelection = ReturnType<typeof useImageSelection>;

function errorOf(field: ImageUploadFieldProps, { upload, selected }: ImageSelection) {
  if (selected?.fitsMinSize === false && field.minSize) {
    return `A imagem precisa ter no mínimo ${formatImageSize(field.minSize)}.`;
  }
  return upload.error?.message ?? field.error;
}

function SizeStatus({ selected }: { selected: SelectedImage | null }) {
  if (selected?.fitsMinSize === undefined) return null;
  const fits = selected.fitsMinSize;

  return (
    <span className={fits ? styles.statusOk : styles.statusBelow}>
      <CatalogIcon name={fits ? 'checkCircle' : 'errorCircle'} size={14} />
      {fits ? 'Tamanho mínimo atendido' : 'Abaixo do mínimo'}
    </span>
  );
}

interface ImagePreviewProps {
  field: ImageUploadFieldProps;
  selection: ImageSelection;
}

function ReplaceImageButton({ field, selection }: ImagePreviewProps) {
  return (
    <label className={styles.replace}>
      <CatalogIcon name="sync" size={14} />
      {selection.upload.isPending ? 'Enviando…' : 'Substituir'}
      <input
        type="file"
        className={styles.hiddenInput}
        accept={ACCEPTED_IMAGE_TYPES}
        aria-label={`Substituir ${lowerFirst(field.label)}`}
        onChange={selection.selectFile}
      />
    </label>
  );
}

function ImageActions({ field, selection }: ImagePreviewProps) {
  return (
    <div className={styles.actions}>
      <ReplaceImageButton field={field} selection={selection} />
      <button
        type="button"
        className={styles.remove}
        aria-label={`Remover ${lowerFirst(field.label)}`}
        disabled={selection.upload.isPending}
        onClick={() => field.onChange('')}
      >
        <CatalogIcon name="delete" size={14} />
      </button>
    </div>
  );
}

function ImagePreview({ field, selection }: ImagePreviewProps) {
  const { selected } = selection;

  return (
    <figure className={styles.preview}>
      <img className={styles.image} src={field.value} alt={`Prévia: ${field.label}`} />
      <figcaption className={styles.caption}>
        <strong className={styles.name}>{selected?.name ?? fileNameOfUrl(field.value)}</strong>
        {selected?.meta && <span className={styles.meta}>{selected.meta}</span>}
      </figcaption>
      <ImageActions field={field} selection={selection} />
    </figure>
  );
}

function ImagePicker({ field, selection }: ImagePreviewProps) {
  return (
    <FileUpload
      label={`Escolher ${lowerFirst(field.label)}`}
      hideLabel
      accept={ACCEPTED_IMAGE_TYPES}
      hint={selection.upload.isPending ? 'Enviando a imagem…' : IMAGE_HINT}
      onChange={selection.selectFile}
    />
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <span className={styles.error} role="alert">
      {message}
    </span>
  );
}

export function ImageUploadField(field: ImageUploadFieldProps) {
  const labelId = useId();
  const selection = useImageSelection(field);
  const error = errorOf(field, selection);
  const Content = field.value ? ImagePreview : ImagePicker;

  return (
    <div
      className={field.compact ? styles.compact : styles.field}
      role="group"
      aria-labelledby={labelId}
    >
      <div className={styles.labelRow}>
        <span id={labelId} className={styles.label}>
          {field.required ? `${field.label} *` : field.label}
        </span>
        <SizeStatus selected={selection.selected} />
      </div>
      <Content field={field} selection={selection} />
      <FieldError message={error} />
    </div>
  );
}
