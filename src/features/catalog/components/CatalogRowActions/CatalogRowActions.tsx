import type { CatalogIconName } from '../../catalog-icon-paths';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './CatalogRowActions.module.css';

interface CatalogRowActionsProps {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}

interface RowAction {
  title: string;
  icon: CatalogIconName;
  className: string | undefined;
  onClick?: () => void;
}

function actionsOf({ onEdit, onDuplicate, onDelete }: CatalogRowActionsProps): RowAction[] {
  return [
    { title: 'Editar', icon: 'edit', className: styles.action, onClick: onEdit },
    { title: 'Duplicar', icon: 'duplicate', className: styles.action, onClick: onDuplicate },
    { title: 'Excluir', icon: 'delete', className: styles.delete, onClick: onDelete },
  ];
}

export function CatalogRowActions(props: CatalogRowActionsProps) {
  return (
    <div className={styles.actions}>
      {actionsOf(props)
        .filter(({ onClick }) => onClick)
        .map(({ title, icon, className, onClick }) => (
          <button
            key={title}
            type="button"
            className={className}
            aria-label={`${title} ${props.name}`}
            title={title}
            onClick={onClick}
          >
            <CatalogIcon name={icon} />
          </button>
        ))}
    </div>
  );
}
