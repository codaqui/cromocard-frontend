import { type ChangeEvent, useId } from 'react';

import { Icon } from '@/components/Icon/Icon';

import styles from './BannerModule.module.css';

interface BannerImageFieldProps {
  error?: string;
  isUploading: boolean;
  onChoose: (file: File) => void;
}

function ImagePickerLabel({
  inputId,
  error,
  isUploading,
}: { inputId: string } & Omit<BannerImageFieldProps, 'onChoose'>) {
  return (
    <label htmlFor={inputId} className={styles.imageRow} data-invalid={Boolean(error)}>
      <Icon name="cloudUpload" size={22} />
      <span className={styles.imageText}>
        <span className={styles.imageLabel}>Imagem do banner</span>
        <span className={styles.imageHint}>Formatos WEBP, PNG (Máx 4MB • 1920×600)</span>
      </span>
      <span className={styles.imageButton}>{isUploading ? 'Enviando…' : 'Upload'}</span>
    </label>
  );
}

function firstFileOf(event: ChangeEvent<HTMLInputElement>): File | undefined {
  const file = event.target.files?.[0];
  event.target.value = '';
  return file;
}

function ImageFileInput({
  inputId,
  error,
  isUploading,
  onChoose,
}: BannerImageFieldProps & { inputId: string }) {
  return (
    <input
      id={inputId}
      type="file"
      accept="image/webp,image/png"
      className={styles.fileInput}
      disabled={isUploading}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${inputId}-error` : undefined}
      onChange={(event) => {
        const file = firstFileOf(event);
        if (file) onChoose(file);
      }}
    />
  );
}

export function BannerImageField(props: BannerImageFieldProps) {
  const inputId = useId();

  return (
    <div className={styles.imageField}>
      <ImagePickerLabel inputId={inputId} error={props.error} isUploading={props.isUploading} />
      <ImageFileInput inputId={inputId} {...props} />
      {props.error && (
        <p id={`${inputId}-error`} className={styles.imageError}>
          {props.error}
        </p>
      )}
    </div>
  );
}
