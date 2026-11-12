import { FormError } from '@/components/FormError/FormError';
import { ApiError } from '@/lib/api-error';

import { importErrorLocation } from '../../catalog.labels';
import styles from './ImportErrorList.module.css';

interface ImportErrorListProps {
  error: Error | null;
}

export function ImportErrorList({ error }: ImportErrorListProps) {
  if (!error) return null;

  const details = error instanceof ApiError ? (error.details ?? []) : [];

  return (
    <div className={styles.errors}>
      <FormError message={error.message} />
      {details.length > 0 && (
        <ul className={styles.list} aria-label="Linhas com erro">
          {details.map((detail) => (
            <li key={`${detail.field}:${detail.message}`}>
              <strong>{importErrorLocation(detail.field)}:</strong> {detail.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
