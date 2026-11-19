import { formatCount } from '../../catalog.format';
import styles from './BulkSelectionBar.module.css';

interface BulkSelectionBarProps {
  count: number;
  onDelete: () => void;
  onClear: () => void;
}

/** "3 selecionadas · Excluir selecionadas · Limpar seleção", no rodapé da lista (frame 832-4908). */
export function BulkSelectionBar({ count, onDelete, onClear }: BulkSelectionBarProps) {
  if (count === 0) return null;

  return (
    <div className={styles.bar}>
      <strong className={styles.count}>
        {formatCount(count)} {count === 1 ? 'selecionada' : 'selecionadas'}
      </strong>
      <button type="button" className={styles.delete} onClick={onDelete}>
        Excluir selecionadas
      </button>
      <button type="button" className={styles.clear} onClick={onClear}>
        Limpar seleção
      </button>
    </div>
  );
}
