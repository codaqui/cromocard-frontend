import { Button } from '@/components/Button/Button';

import styles from './CatalogRowActions.module.css';

interface CatalogRowActionsProps {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function CatalogRowActions({ name, onEdit, onDelete }: CatalogRowActionsProps) {
  return (
    <div className={styles.actions}>
      <Button variant="secondary" aria-label={`Editar ${name}`} onClick={onEdit}>
        Editar
      </Button>
      <Button variant="danger" aria-label={`Excluir ${name}`} onClick={onDelete}>
        Excluir
      </Button>
    </div>
  );
}
