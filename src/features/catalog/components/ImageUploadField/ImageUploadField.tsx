import type { ChangeEvent } from 'react';

import { Button } from '@/components/Button/Button';
import { FileUpload } from '@/components/FileUpload/FileUpload';

import { useUploadImage } from '../../catalog.queries';
import type { UploadFolder } from '../../catalog.types';
import styles from './ImageUploadField.module.css';

const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/webp';
const IMAGE_HINT = 'PNG, JPG ou WEBP até 4 MB';

interface ImageUploadFieldProps {
  label: string;
  folder: UploadFolder;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  removable?: boolean;
}

function useImageSelection(folder: UploadFolder, onChange: (url: string) => void) {
  const upload = useUploadImage();

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) upload.mutate({ folder, file }, { onSuccess: (image) => onChange(image.url) });
  };

  return { upload, selectFile };
}

function RemoveImageButton({ disabled, onRemove }: { disabled: boolean; onRemove: () => void }) {
  return (
    <Button variant="secondary" className={styles.remove} disabled={disabled} onClick={onRemove}>
      Remover imagem
    </Button>
  );
}

export function ImageUploadField({ removable = false, ...field }: ImageUploadFieldProps) {
  const { label, folder, value, onChange, error } = field;
  const { upload, selectFile } = useImageSelection(folder, onChange);

  return (
    <div className={styles.field}>
      <FileUpload
        label={label}
        accept={ACCEPTED_IMAGE_TYPES}
        hint={upload.isPending ? 'Enviando a imagem…' : IMAGE_HINT}
        error={upload.error?.message ?? error}
        onChange={selectFile}
      />
      {value && <img className={styles.preview} src={value} alt={`Prévia: ${label}`} />}
      {removable && value && (
        <RemoveImageButton disabled={upload.isPending} onRemove={() => onChange('')} />
      )}
    </div>
  );
}
