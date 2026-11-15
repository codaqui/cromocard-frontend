import { useId } from 'react';

import styles from './RowsPerPage.module.css';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

interface RowsPerPageProps {
  value: number;
  onChange: (pageSize: number) => void;
}

export function RowsPerPage({ value, onChange }: RowsPerPageProps) {
  const selectId = useId();

  return (
    <div className={styles.rows}>
      <label htmlFor={selectId} className={styles.label}>
        Linhas por página:
      </label>
      <select
        id={selectId}
        className={styles.select}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
}
