import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './CatalogRowActions.module.css';

interface CatalogRowActionsProps {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function CatalogRowActions({ name, onEdit, onDelete }: CatalogRowActionsProps) {
  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.action}
        aria-label={`Editar ${name}`}
        title="Editar"
        onClick={onEdit}
      >
        <CatalogIcon name="edit" />
      </button>
      <button
        type="button"
        className={styles.delete}
        aria-label={`Excluir ${name}`}
        title="Excluir"
        onClick={onDelete}
      >
        <CatalogIcon name="delete" />
      </button>
    </div>
  );
}
