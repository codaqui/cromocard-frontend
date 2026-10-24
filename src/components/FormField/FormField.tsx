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

export function FormField({ inputId, label, hint, error, children }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      {children}
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
    </div>
  );
}
