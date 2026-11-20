import styles from './FieldLabelRow.module.css';

interface FieldLabelRowProps {
  htmlFor: string;
  label: string;
  error?: string;
  errorId?: string;
  counter?: string;
}

export function FieldLabelRow({ htmlFor, label, error, errorId, counter }: FieldLabelRowProps) {
  return (
    <div className={styles.row}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>
      <span className={styles.aside}>
        {counter && <span className={styles.counter}>{counter}</span>}
        {error && (
          <span id={errorId} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </span>
    </div>
  );
}
