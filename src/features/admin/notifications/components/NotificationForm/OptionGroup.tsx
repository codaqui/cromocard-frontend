import type { ReactNode } from 'react';

import styles from './NotificationForm.module.css';

interface OptionGroupProps {
  legend: string;
  error?: string;
  children: ReactNode;
}

export function OptionGroup({ legend, error, children }: OptionGroupProps) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>{children}</div>
      {error && (
        <p className={styles.groupError} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
