import { type ChangeEvent, type DragEvent, useEffect, useId, useState } from 'react';

import {
  belowMinMetaOf,
  fileNameOfUrl,
  formatImageSize,
  type ImageSize,
  imageMetaOf,
  localPreviewUrl,
  meetsMinSize,
  readImageSize,
  releasePreviewUrl,
} from '../../catalog.image';
import { useUploadImage } from '../../catalog.queries';
import type { UploadFolder } from '../../catalog.types';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './ImageUploadField.module.css';

const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/webp';
const IMAGE_HINT = 'PNG, JPG ou WEBP até 4 MB';

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

const allowDrop = (event: DragEvent) => event.preventDefault();

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
  /** Prévia local da imagem recusada, que não chega a ser enviada (frame 832-7170). */
  previewUrl?: string;
}

async function checkImage(file: File, minSize?: ImageSize): Promise<SelectedImage> {
  const size = await readImageSize(file);
  if (!minSize) return { name: file.name, meta: imageMetaOf(file, size) };
  if (meetsMinSize(size, minSize)) {
    return { name: file.name, meta: imageMetaOf(file, size), fitsMinSize: true };
  }
  return {
    name: file.name,
    meta: belowMinMetaOf(file, size, minSize),
    fitsMinSize: false,
    previewUrl: localPreviewUrl(file),
  };
}

function useReleasedPreview(url?: string) {
  useEffect(() => {
    if (!url) return;
    return () => releasePreviewUrl(url);
  }, [url]);
}

function useImageSelection({ folder, minSize, onChange }: ImageUploadFieldProps) {
  const upload = useUploadImage();
  const [selected, setSelected] = useState<SelectedImage | null>(null);
  useReleasedPreview(selected?.previewUrl);

  const chooseFile = async (file?: File) => {
    if (!file) return;
    const image = await checkImage(file, minSize);
    setSelected(image);
    if (image.fitsMinSize === false) return;
    upload.mutate({ folder, file }, { onSuccess: ({ url }) => onChange(url) });
  };

  return {
    upload,
    selected,
    selectFile: (event: ChangeEvent<HTMLInputElement>) => void chooseFile(event.target.files?.[0]),
    dropFile: (event: DragEvent) => {
      event.preventDefault();
      void chooseFile(event.dataTransfer.files[0]);
    },
    clear: () => {
      setSelected(null);
      onChange('');
    },
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

interface ImageContentProps {
  field: ImageUploadFieldProps;
  selection: ImageSelection;
}

function HiddenFileInput({ label, selection }: { label: string; selection: ImageSelection }) {
  return (
    <input
      type="file"
      className={styles.hiddenInput}
      accept={ACCEPTED_IMAGE_TYPES}
      aria-label={label}
      onChange={selection.selectFile}
    />
  );
}

function ReplaceImageButton({ field, selection }: ImageContentProps) {
  return (
    <label className={styles.replace}>
      <CatalogIcon name="sync" size={14} />
      {selection.upload.isPending ? 'Enviando…' : 'Substituir'}
      <HiddenFileInput label={`Substituir ${lowerFirst(field.label)}`} selection={selection} />
    </label>
  );
}

function ImageActions({ field, selection }: ImageContentProps) {
  return (
    <div className={styles.actions}>
      <ReplaceImageButton field={field} selection={selection} />
      <button
        type="button"
        className={styles.remove}
        aria-label={`Remover ${lowerFirst(field.label)}`}
        disabled={selection.upload.isPending}
        onClick={selection.clear}
      >
        <CatalogIcon name="delete" size={14} />
      </button>
    </div>
  );
}

/** A imagem mostrada: a recusada (só local) ou a que está salva no item. */
function shownImageOf({ field, selection }: ImageContentProps) {
  const { selected } = selection;
  const src = selected?.previewUrl ?? field.value;
  const name = selected?.name ?? fileNameOfUrl(src);
  return { src, name, meta: selected?.meta, below: selected?.fitsMinSize === false };
}

function ImageCaption({ name, meta, below }: Omit<ReturnType<typeof shownImageOf>, 'src'>) {
  return (
    <span className={styles.caption}>
      <strong className={styles.name}>{name}</strong>
      {meta && <span className={below ? styles.metaBelow : styles.meta}>{meta}</span>}
    </span>
  );
}

/** Prévia grande, como a frente da carta e a capa do álbum no Figma. */
function ImagePreview(content: ImageContentProps) {
  const { src, ...caption } = shownImageOf(content);

  return (
    <div className={styles.panel} onDragOver={allowDrop} onDrop={content.selection.dropFile}>
      <img className={styles.image} src={src} alt={`Prévia: ${content.field.label}`} />
      <ImageCaption {...caption} />
      <ImageActions {...content} />
    </div>
  );
}

/** Sem imagem: a área para soltar ou escolher o arquivo, no mesmo quadro da prévia. */
function ImagePicker({ field, selection }: ImageContentProps) {
  return (
    <label className={styles.dropzone} onDragOver={allowDrop} onDrop={selection.dropFile}>
      <CatalogIcon name="cloudUpload" size={32} />
      <strong className={styles.dropTitle}>Arraste a imagem ou clique para escolher</strong>
      <span className={styles.meta}>
        {selection.upload.isPending ? 'Enviando a imagem…' : IMAGE_HINT}
      </span>
      <HiddenFileInput label={`Escolher ${lowerFirst(field.label)}`} selection={selection} />
    </label>
  );
}

/** Na linha do verso, as ações são só ícones: a nuvem substitui e a lixeira remove. */
function CompactActions({ field, selection }: ImageContentProps) {
  return (
    <div className={styles.actions}>
      <label className={styles.upload}>
        <CatalogIcon name="cloudUpload" size={18} />
        <HiddenFileInput label={`Substituir ${lowerFirst(field.label)}`} selection={selection} />
      </label>
      <button
        type="button"
        className={styles.remove}
        aria-label={`Remover ${lowerFirst(field.label)}`}
        disabled={selection.upload.isPending}
        onClick={selection.clear}
      >
        <CatalogIcon name="delete" size={14} />
      </button>
    </div>
  );
}

/** Linha do verso com a imagem salva: miniatura, nome e as ações. */
function CompactPreview(content: ImageContentProps) {
  const { src, ...caption } = shownImageOf(content);

  return (
    <div className={styles.row} onDragOver={allowDrop} onDrop={content.selection.dropFile}>
      <img className={styles.thumb} src={src} alt={`Prévia: ${content.field.label}`} />
      <ImageCaption {...caption} />
      <CompactActions {...content} />
    </div>
  );
}

/** Linha do verso vazia, com o botão de nuvem do Figma. */
function CompactPicker({ field, selection }: ImageContentProps) {
  return (
    <div className={styles.row} onDragOver={allowDrop} onDrop={selection.dropFile}>
      <span className={styles.thumbPlaceholder} aria-hidden="true">
        <CatalogIcon name="image" size={20} />
      </span>
      <span className={styles.caption}>
        <strong className={styles.name}>Nenhuma imagem enviada</strong>
        <span className={styles.meta}>{IMAGE_HINT}</span>
      </span>
      <label className={styles.upload}>
        <CatalogIcon name="cloudUpload" size={18} />
        <HiddenFileInput label={`Escolher ${lowerFirst(field.label)}`} selection={selection} />
      </label>
    </div>
  );
}

const imageContents = {
  preview: ImagePreview,
  picker: ImagePicker,
  compactPreview: CompactPreview,
  compactPicker: CompactPicker,
};

function contentKindOf(field: ImageUploadFieldProps, selection: ImageSelection) {
  const hasImage = Boolean(field.value || selection.selected?.previewUrl);
  if (field.compact) return hasImage ? 'compactPreview' : 'compactPicker';
  return hasImage ? 'preview' : 'picker';
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
  const Content = imageContents[contentKindOf(field, selection)];

  return (
    <div className={styles.field} role="group" aria-labelledby={labelId}>
      <div className={styles.labelRow}>
        <span id={labelId} className={styles.label}>
          {field.required ? `${field.label} *` : field.label}
        </span>
        <SizeStatus selected={selection.selected} />
      </div>
      <Content field={field} selection={selection} />
      <FieldError message={errorOf(field, selection)} />
    </div>
  );
}
