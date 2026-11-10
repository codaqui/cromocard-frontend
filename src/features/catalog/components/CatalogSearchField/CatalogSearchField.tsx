import type { CatalogIconName } from '../../catalog-icon-paths';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './CatalogSearchField.module.css';

interface CatalogSearchFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: CatalogIconName;
  numeric?: boolean;
}

function inputTypeOf(numeric: boolean) {
  return numeric ? { type: 'number', inputMode: 'numeric' as const, min: 1 } : { type: 'search' };
}

export function CatalogSearchField({
  label,
  placeholder,
  value,
  onChange,
  icon = 'search',
  numeric = false,
}: CatalogSearchFieldProps) {
  return (
    <div className={numeric ? styles.compact : styles.field}>
      <span className={styles.icon}>
        <CatalogIcon name={icon} size={20} />
      </span>
      <input
        {...inputTypeOf(numeric)}
        aria-label={label}
        placeholder={placeholder}
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
