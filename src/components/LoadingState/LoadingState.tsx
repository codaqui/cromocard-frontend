import styles from './LoadingState.module.css';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Carregando…' }: LoadingStateProps) {
  return (
    <div className={styles.loading} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      {message}
    </div>
  );
}
