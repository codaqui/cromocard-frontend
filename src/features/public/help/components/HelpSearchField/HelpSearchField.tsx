import { Icon } from '@/components/Icon/Icon';

import styles from './HelpSearchField.module.css';

interface HelpSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function HelpSearchField({ value, onChange }: HelpSearchFieldProps) {
  return (
    <label className={styles.search}>
      <Icon name="search" size={16} />
      <input
        type="search"
        className={styles.input}
        aria-label="Buscar nas perguntas frequentes"
        placeholder="Busque por “pagamento”, “frete”, “álbum”..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
