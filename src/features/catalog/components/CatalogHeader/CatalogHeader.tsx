import { Button } from '@/components/Button/Button';

import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './CatalogHeader.module.css';

export type CatalogCreateAction = 'card' | 'album' | 'import';

interface CatalogHeaderProps {
  onAction: (action: CatalogCreateAction) => void;
}

function CatalogActions({ onAction }: CatalogHeaderProps) {
  return (
    <div className={styles.actions}>
      <Button onClick={() => onAction('card')}>
        <CatalogIcon name="addCard" />+ Cadastrar Carta
      </Button>
      <Button variant="secondary" onClick={() => onAction('album')}>
        <span className={styles.albumIcon}>
          <CatalogIcon name="libraryAdd" />
        </span>
        + Novo Álbum
      </Button>
      <Button variant="secondary" onClick={() => onAction('import')}>
        <CatalogIcon name="upload" />
        Importar CSV
      </Button>
    </div>
  );
}

export function CatalogHeader({ onAction }: CatalogHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <span className={styles.badge}>Catálogo central</span>
        <h1 className={styles.title}>Gestão de Catálogo</h1>
        <p className={styles.subtitle}>
          Controle soberano de referências cardgráficas, taxonomia de espécimes colecionáveis,
          homologação de álbuns e ingestão serializada em massa via arquivo.
        </p>
      </div>
      <CatalogActions onAction={onAction} />
    </header>
  );
}
