import styles from './ErrorState.module.css';

interface ErrorStateProps {
  title?: string;
  message?: string;
}

export function ErrorState({
  title = 'Algo deu errado',
  message = 'Tente novamente em instantes.',
}: ErrorStateProps) {
  return (
    <div className={styles.error} role="alert">
      <h2 className={styles.title}>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
