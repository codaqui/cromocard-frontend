import { Button } from '@/components/Button/Button';

import type { CatalogIconName } from '../../catalog-icon-paths';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './CatalogHeader.module.css';

export type CatalogCreateAction = 'card' | 'album' | 'category' | 'import';

export type CatalogTabId = 'cards' | 'albums' | 'categories';

interface HeaderAction {
  action: CatalogCreateAction;
  label: string;
  icon: CatalogIconName;
  variant: 'primary' | 'secondary';
}

const importCsv: HeaderAction = {
  action: 'import',
  label: 'Importar CSV',
  icon: 'upload',
  variant: 'secondary',
};

const newAlbum = (variant: HeaderAction['variant']): HeaderAction => ({
  action: 'album',
  label: '+ Novo Álbum',
  icon: variant === 'primary' ? 'addCard' : 'libraryAdd',
  variant,
});

/** Os botões do topo mudam com a aba, como nos frames 208-2895, 832-8603 e 833-9132. */
const actionsByTab: Record<CatalogTabId, HeaderAction[]> = {
  cards: [
    importCsv,
    { action: 'card', label: '+ Cadastrar Carta', icon: 'addCard', variant: 'primary' },
    newAlbum('secondary'),
  ],
  albums: [newAlbum('primary')],
  categories: [
    { action: 'category', label: '+ Nova Categoria', icon: 'addCard', variant: 'primary' },
  ],
};

interface CatalogHeaderProps {
  activeTab: CatalogTabId;
  onAction: (action: CatalogCreateAction) => void;
}

function CatalogActions({ activeTab, onAction }: CatalogHeaderProps) {
  return (
    <div className={styles.actions}>
      {actionsByTab[activeTab].map(({ action, label, icon, variant }) => (
        <Button key={action} variant={variant} onClick={() => onAction(action)}>
          <CatalogIcon name={icon} />
          {label}
        </Button>
      ))}
    </div>
  );
}

export function CatalogHeader({ activeTab, onAction }: CatalogHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <span className={styles.badge}>Catálogo</span>
        <h1 className={styles.title}>Gestão de Catálogo</h1>
        <p className={styles.subtitle}>
          Cadastre e organize as cartas, os álbuns e as categorias do catálogo.
        </p>
      </div>
      <CatalogActions activeTab={activeTab} onAction={onAction} />
    </header>
  );
}
