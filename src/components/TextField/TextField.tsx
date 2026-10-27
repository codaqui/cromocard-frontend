import { type ComponentProps, useId } from 'react';

import { describedByOf } from '@/components/FormField/field-ids';
import { FormField } from '@/components/FormField/FormField';

import styles from './TextField.module.css';

interface TextFieldProps extends ComponentProps<'input'> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextField({ label, hint, error, id, ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FormField inputId={inputId} label={label} hint={hint} error={error}>
      <input
        id={inputId}
        className={styles.input}
        aria-invalid={Boolean(error)}
        aria-describedby={describedByOf(inputId, { hint, error })}
        {...inputProps}
      />
    </FormField>
  );
}
