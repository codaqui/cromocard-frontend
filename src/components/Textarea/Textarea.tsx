import { type ComponentProps, useId } from 'react';

import { describedByOf } from '@/components/FormField/field-ids';
import { FormField } from '@/components/FormField/FormField';

import styles from './Textarea.module.css';

interface TextareaProps extends ComponentProps<'textarea'> {
  label: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, id, rows = 4, ...textareaProps }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <FormField inputId={textareaId} label={label} hint={hint} error={error}>
      <textarea
        id={textareaId}
        rows={rows}
        className={styles.textarea}
        aria-invalid={Boolean(error)}
        aria-describedby={describedByOf(textareaId, { hint, error })}
        {...textareaProps}
      />
    </FormField>
  );
}
