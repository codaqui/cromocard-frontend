import { ApiError } from '@/lib/api-error';

import { importErrorLocation } from '../../catalog.format';
import styles from './ImportErrorList.module.css';

interface ImportErrorListProps {
  error: Error | null;
}

/** As linhas recusadas do CSV, no quadro vermelho do frame 832-3837. */
export function ImportErrorList({ error }: ImportErrorListProps) {
  const details = error instanceof ApiError ? (error.details ?? []) : [];
  if (details.length === 0) return null;

  return (
    <ul className={styles.list} aria-label="Linhas com erro">
      {details.map((detail) => (
        <li key={`${detail.field}:${detail.message}`}>
          {importErrorLocation(detail.field)}: {detail.message}
        </li>
      ))}
    </ul>
  );
}
