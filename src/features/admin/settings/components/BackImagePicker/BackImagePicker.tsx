import { type ChangeEvent, useId } from 'react';

import type { DefaultCategory } from '../../settings.types';
import styles from './BackImagePicker.module.css';

export interface BackImagePickerProps {
  category: DefaultCategory;
  isUploading: boolean;
  onChoose: (file: File) => void;
}

function backActionOf({ backImageUrl }: DefaultCategory, isUploading: boolean): string {
  if (isUploading) return 'Enviando…';
  return backImageUrl ? 'Trocar verso' : 'Enviar verso';
}

function BackThumb({ url }: { url: string | null }) {
  if (url) return <img className={styles.backThumb} src={url} alt="" />;
  return <span className={styles.backEmpty} aria-hidden="true" />;
}

function chosenFile(event: ChangeEvent<HTMLInputElement>): File | undefined {
  const file = event.target.files?.[0];
  event.target.value = '';
  return file;
}

interface BackFileInputProps {
  inputId: string;
  label: string;
  disabled: boolean;
  onChoose: (file: File) => void;
}

function BackFileInput({ inputId, label, disabled, onChoose }: BackFileInputProps) {
  return (
    <input
      id={inputId}
      type="file"
      accept="image/png,image/jpeg,image/webp"
      className={styles.fileInput}
      aria-label={label}
      disabled={disabled}
      onChange={(event) => {
        const file = chosenFile(event);
        if (file) onChoose(file);
      }}
    />
  );
}

export function BackImagePicker({ category, isUploading, onChoose }: BackImagePickerProps) {
  const inputId = useId();
  const action = backActionOf(category, isUploading);
  const input = {
    inputId,
    label: `${action} de ${category.name}`,
    disabled: isUploading,
    onChoose,
  };

  return (
    <>
      <label htmlFor={inputId} className={styles.back}>
        <BackThumb url={category.backImageUrl} />
        {action}
      </label>
      <BackFileInput {...input} />
    </>
  );
}
