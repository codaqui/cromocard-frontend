import type { ReactNode } from 'react';

import { errorIdOf, hintIdOf } from './field-ids';
import styles from './FormField.module.css';

interface FormFieldProps {
  inputId: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

interface FieldMessagesProps {
  inputId: string;
  hint?: string;
  error?: string;
}

export function FieldMessages({ inputId, hint, error }: FieldMessagesProps) {
  return (
    <>
      {hint && (
        <span id={hintIdOf(inputId)} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorIdOf(inputId)} className={styles.error}>
          {error}
        </span>
      )}
    </>
  );
}

export function FormField({ inputId, label, hint, error, children }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      {children}
      <FieldMessages inputId={inputId} hint={hint} error={error} />
    </div>
  );
}
