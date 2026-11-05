import { useState } from 'react';

import { Tabs } from '@/components/Tabs/Tabs';

import { AlbumsTab } from '../../components/AlbumsTab/AlbumsTab';
import { CardsTab } from '../../components/CardsTab/CardsTab';
import { CategoriesTab } from '../../components/CategoriesTab/CategoriesTab';
import styles from './CatalogAdminPage.module.css';

const catalogTabs = [
  { id: 'cards', label: 'Todas as Cartas', Content: CardsTab },
  { id: 'albums', label: 'Álbuns Oficiais', Content: AlbumsTab },
  { id: 'categories', label: 'Categorias & Franquias', Content: CategoriesTab },
] as const;

type CatalogTabId = (typeof catalogTabs)[number]['id'];

export function CatalogAdminPage() {
  const [activeTab, setActiveTab] = useState<CatalogTabId>('cards');
  const { Content } = catalogTabs.find((tab) => tab.id === activeTab) ?? catalogTabs[0];

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Catálogo</h1>
      <Tabs
        label="Itens do catálogo"
        items={[...catalogTabs]}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as CatalogTabId)}
      >
        <Content />
      </Tabs>
    </section>
  );
}
