import { Button } from '@/components/Button/Button';
import { ErrorState } from '@/components/ErrorState/ErrorState';

import styles from './RetryableError.module.css';

interface RetryableErrorProps {
  message: string;
  onRetry: () => void;
}

export function RetryableError({ message, onRetry }: RetryableErrorProps) {
  return (
    <div className={styles.feedback}>
      <ErrorState message={message} />
      <Button variant="secondary" onClick={onRetry}>
        Tentar de novo
      </Button>
    </div>
  );
}
