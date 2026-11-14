import type { ReactNode } from 'react';

import { errorIdOf, hintIdOf } from './field-ids';
import styles from './FormField.module.css';

/** Opções de rótulo que TextField e Select repassam ao FormField. */
export interface FieldLabelOptions {
  /** Esconde o rótulo na tela e mantém para leitores de tela (o campo mostra o texto no placeholder). */
  hideLabel?: boolean;
  /** Texto curto alinhado à direita do rótulo, como "obrigatório" ou "único" no Figma. */
  labelAside?: string;
}

interface FormFieldProps extends FieldLabelOptions {
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

function FieldLabel({
  inputId,
  label,
  hideLabel,
  labelAside,
}: FieldLabelOptions & { inputId: string; label: string }) {
  if (hideLabel) {
    return (
      <label htmlFor={inputId} className={styles.visuallyHidden}>
        {label}
      </label>
    );
  }
  return (
    <div className={styles.labelRow}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      {labelAside && <span className={styles.labelAside}>{labelAside}</span>}
    </div>
  );
}

export function FormField({
  inputId,
  label,
  hint,
  error,
  children,
  ...labelOptions
}: FormFieldProps) {
  return (
    <div className={styles.field}>
      <FieldLabel inputId={inputId} label={label} {...labelOptions} />
      {children}
      <FieldMessages inputId={inputId} hint={hint} error={error} />
    </div>
  );
}
