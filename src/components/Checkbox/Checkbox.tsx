import { type ComponentProps, type ReactNode, useId } from 'react';

import { describedByOf } from '@/components/FormField/field-ids';
import { FieldMessages } from '@/components/FormField/FormField';

import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: ReactNode;
  hint?: string;
  error?: string;
  hideLabel?: boolean;
}

export function Checkbox({ label, hint, error, id, hideLabel, ...inputProps }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <div className={styles.field}>
      <label htmlFor={checkboxId} className={hideLabel ? styles.touchLabel : styles.label}>
        <input
          id={checkboxId}
          type="checkbox"
          className={styles.checkbox}
          aria-invalid={Boolean(error)}
          aria-describedby={describedByOf(checkboxId, { hint, error })}
          {...inputProps}
        />
        {hideLabel ? <span className={styles.visuallyHidden}>{label}</span> : label}
      </label>
      <FieldMessages inputId={checkboxId} hint={hint} error={error} />
    </div>
  );
}
