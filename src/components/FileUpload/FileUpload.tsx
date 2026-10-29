import { type ChangeEvent, type ComponentProps, useId, useState } from 'react';

import { describedByOf } from '@/components/FormField/field-ids';
import { FormField } from '@/components/FormField/FormField';
import { Icon } from '@/components/Icon/Icon';

import styles from './FileUpload.module.css';

interface FileUploadProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: string;
  hint?: string;
  error?: string;
}

const NO_FILE_LABEL = 'Nenhum arquivo escolhido';

function useSelectedFileName(onChange?: (event: ChangeEvent<HTMLInputElement>) => void) {
  const [fileName, setFileName] = useState(NO_FILE_LABEL);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.files?.[0]?.name ?? NO_FILE_LABEL);
    onChange?.(event);
  };

  return { fileName, handleChange };
}

export function FileUpload({ label, hint, error, id, onChange, ...inputProps }: FileUploadProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const { fileName, handleChange } = useSelectedFileName(onChange);

  return (
    <FormField inputId={inputId} label={label} hint={hint} error={error}>
      <div className={styles.row} data-invalid={Boolean(error)}>
        <span className={styles.icon}>
          <Icon name="upload" />
        </span>
        <span className={styles.fileName}>{fileName}</span>
        <input
          id={inputId}
          type="file"
          className={styles.input}
          aria-invalid={Boolean(error)}
          aria-describedby={describedByOf(inputId, { hint, error })}
          onChange={handleChange}
          {...inputProps}
        />
      </div>
    </FormField>
  );
}
