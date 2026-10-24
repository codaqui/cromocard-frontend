import { type ComponentProps, useId } from 'react';

import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: string;
  error?: string;
}

export function Checkbox({ label, error, id, ...inputProps }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const errorId = `${checkboxId}-error`;

  return (
    <div className={styles.field}>
      <label htmlFor={checkboxId} className={styles.label}>
        <input
          id={checkboxId}
          type="checkbox"
          className={styles.checkbox}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        {label}
      </label>
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
