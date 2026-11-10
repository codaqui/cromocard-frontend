import { type ReactNode, useState } from 'react';

import { Tabs } from '@/components/Tabs/Tabs';

import type { CatalogIconName } from '../../catalog-icon-paths';
import type { CatalogTabProps } from '../../catalog.types';
import { AlbumsTab } from '../../components/AlbumsTab/AlbumsTab';
import { CardsTab } from '../../components/CardsTab/CardsTab';
import { CatalogCreateDialogs } from '../../components/CatalogCreateDialogs/CatalogCreateDialogs';
import { CatalogHeader } from '../../components/CatalogHeader/CatalogHeader';
import { CatalogIcon } from '../../components/CatalogIcon/CatalogIcon';
import { CatalogStats } from '../../components/CatalogStats/CatalogStats';
import { CategoriesTab } from '../../components/CategoriesTab/CategoriesTab';
import { RowsPerPage } from '../../components/RowsPerPage/RowsPerPage';
import { useCatalogCreate } from '../../hooks/useCatalogCreate';
import { type CatalogTotals, useCatalogTotals } from '../../hooks/useCatalogTotals';
import styles from './CatalogAdminPage.module.css';

const DEFAULT_PAGE_SIZE = 20;

const catalogTabs = [
  { id: 'cards', label: 'Todas as Cartas', icon: 'tableRows', total: 'cards', Content: CardsTab },
  { id: 'albums', label: 'Álbuns Oficiais', icon: 'menuBook', total: 'albums', Content: AlbumsTab },
  {
    id: 'categories',
    label: 'Categorias & Franquias',
    icon: 'category',
    total: 'categories',
    Content: CategoriesTab,
  },
] as const satisfies {
  id: string;
  label: string;
  icon: CatalogIconName;
  total: keyof CatalogTotals;
  Content: (props: CatalogTabProps) => ReactNode;
}[];

type CatalogTabId = (typeof catalogTabs)[number]['id'];

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
  notify: (message: string) => void;
}

function CatalogTabs({ totals, notify }: CatalogTabsProps) {
  const [activeTab, setActiveTab] = useState<CatalogTabId>('cards');
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const { Content } = catalogTabs.find((tab) => tab.id === activeTab) ?? catalogTabs[0];

  return (
    <Tabs
      label="Itens do catálogo"
      items={tabItems(totals)}
      activeId={activeTab}
      onChange={(id) => setActiveTab(id as CatalogTabId)}
      actions={<RowsPerPage value={pageSize} onChange={setPageSize} />}
    >
      <Content pageSize={pageSize} notify={notify} />
    </Tabs>
  );
}

export function CatalogAdminPage() {
  const totals = useCatalogTotals();
  const create = useCatalogCreate();

  return (
    <section className={styles.page}>
      <CatalogHeader onAction={create.open} />
      <CatalogStats totals={totals} />
      <CatalogTabs totals={totals} notify={create.notify} />
      <CatalogCreateDialogs state={create} />
    </section>
  );
}
