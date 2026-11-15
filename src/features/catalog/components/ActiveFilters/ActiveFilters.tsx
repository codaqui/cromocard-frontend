import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './ActiveFilters.module.css';

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ActiveFiltersProps {
  chips: FilterChip[];
  summary?: string;
  onClearAll: () => void;
}

function Chips({ chips, onClearAll }: Omit<ActiveFiltersProps, 'summary'>) {
  return (
    <div className={styles.chips}>
      <span className={styles.title}>Filtros ativos:</span>
      {chips.map((chip) => (
        <span key={chip.key} className={styles.chip}>
          {chip.label}
          <button
            type="button"
            className={styles.remove}
            aria-label={`Remover filtro ${chip.label}`}
            onClick={chip.onRemove}
          >
            <CatalogIcon name="close" size={14} />
          </button>
        </span>
      ))}
      <button type="button" className={styles.clear} onClick={onClearAll}>
        Limpar todos os filtros
      </button>
    </div>
  );
}

export function ActiveFilters({ chips, summary, onClearAll }: ActiveFiltersProps) {
  return (
    <div className={styles.row}>
      {chips.length > 0 ? <Chips chips={chips} onClearAll={onClearAll} /> : <span />}
      {summary && <p className={styles.summary}>{summary}</p>}
    </div>
  );
}
