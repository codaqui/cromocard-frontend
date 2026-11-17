import styles from './FieldLabelRow.module.css';

interface FieldLabelRowProps {
  htmlFor: string;
  label: string;
  error?: string;
  errorId?: string;
  /** "41/120", com o tamanho atual e o máximo. */
  counter?: string;
}

/** Rótulo com o contador e a mensagem de erro à direita, como nos frames 208-2380 e 827-1523. */
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
