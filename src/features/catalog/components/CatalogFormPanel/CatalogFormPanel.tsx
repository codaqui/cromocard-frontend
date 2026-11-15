import { type ReactNode, useId } from 'react';

import type { CatalogIconName } from '../../catalog-icon-paths';
import { CatalogIcon } from '../CatalogIcon/CatalogIcon';
import styles from './CatalogFormPanel.module.css';

interface CatalogFormPanelProps {
  icon: CatalogIconName;
  title: string;
  /** Texto à direita do título, como "Mín. 1200×1600 px" no painel de imagens. */
  aside?: string;
  children: ReactNode;
}

/** Painel do formulário com título e ícone, como "Dados da carta" e "Imagens" no frame 278-3246. */
export function CatalogFormPanel({ icon, title, aside, children }: CatalogFormPanelProps) {
  const titleId = useId();

  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          <CatalogIcon name={icon} size={16} />
          {title}
        </h3>
        {aside && <span className={styles.aside}>{aside}</span>}
      </div>
      {children}
    </section>
  );
}
