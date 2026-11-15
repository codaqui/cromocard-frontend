import { type ReactNode, useState } from 'react';

import { Tabs } from '@/components/Tabs/Tabs';

import type { CatalogIconName } from '../../catalog-icon-paths';
import type { CatalogNotice, CatalogTabProps } from '../../catalog.types';
import { AlbumsTab } from '../../components/AlbumsTab/AlbumsTab';
import { CardsTab } from '../../components/CardsTab/CardsTab';
import { CatalogCreateDialogs } from '../../components/CatalogCreateDialogs/CatalogCreateDialogs';
import { CatalogHeader, type CatalogTabId } from '../../components/CatalogHeader/CatalogHeader';
import { CatalogIcon } from '../../components/CatalogIcon/CatalogIcon';
import { CatalogStats } from '../../components/CatalogStats/CatalogStats';
import { CategoriesTab } from '../../components/CategoriesTab/CategoriesTab';
import { RowsPerPage } from '../../components/RowsPerPage/RowsPerPage';
import { useCatalogCreate } from '../../hooks/useCatalogCreate';
import { type CatalogTotals, useCatalogTotals } from '../../hooks/useCatalogTotals';
import styles from './CatalogAdminPage.module.css';

const DEFAULT_PAGE_SIZE = 20;

interface CatalogTab {
  id: CatalogTabId;
  label: string;
  icon: CatalogIconName;
  total: keyof CatalogTotals;
  Content: (props: CatalogTabProps) => ReactNode;
}

const tabsById: Record<CatalogTabId, CatalogTab> = {
  cards: {
    id: 'cards',
    label: 'Todas as Cartas',
    icon: 'tableRows',
    total: 'cards',
    Content: CardsTab,
  },
  albums: {
    id: 'albums',
    label: 'Álbuns Oficiais',
    icon: 'menuBook',
    total: 'albums',
    Content: AlbumsTab,
  },
  categories: {
    id: 'categories',
    label: 'Categorias & Franquias',
    icon: 'category',
    total: 'categories',
    Content: CategoriesTab,
  },
};

const catalogTabs = Object.values(tabsById);

function tabItems(totals: CatalogTotals) {
  return catalogTabs.map(({ id, label, icon, total }) => ({
    id,
    label: (
      <>
        <CatalogIcon name={icon} />
        {label}
      </>
    ),
    count: totals[total],
  }));
}

interface CatalogTabsProps {
  totals: CatalogTotals;
  activeTab: CatalogTabId;
  onTabChange: (id: CatalogTabId) => void;
  notify: (notice: CatalogNotice) => void;
}

function CatalogTabs({ totals, activeTab, onTabChange, notify }: CatalogTabsProps) {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { Content } = tabsById[activeTab];

  return (
    <Tabs
      label="Itens do catálogo"
      items={tabItems(totals)}
      activeId={activeTab}
      onChange={onTabChange}
      actions={<RowsPerPage value={pageSize} onChange={setPageSize} />}
    >
      <Content pageSize={pageSize} notify={notify} />
    </Tabs>
  );
}

export function CatalogAdminPage() {
  const totals = useCatalogTotals();
  const create = useCatalogCreate();
  const [activeTab, setActiveTab] = useState<CatalogTabId>('cards');

  return (
    <section className={styles.page}>
      <CatalogHeader activeTab={activeTab} onAction={create.open} />
      <CatalogStats totals={totals} />
      <CatalogTabs
        totals={totals}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notify={create.notify}
      />
      <CatalogCreateDialogs state={create} />
    </section>
  );
}
