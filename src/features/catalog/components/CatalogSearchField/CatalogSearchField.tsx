import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './CatalogSearchField.module.css';

interface CatalogSearchFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function CatalogSearchField({
  label,
  placeholder,
  value,
  onChange,
}: CatalogSearchFieldProps) {
  return (
    <div className={styles.field}>
      <span className={styles.icon}>
        <CatalogIcon name="search" size={20} />
      </span>
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
