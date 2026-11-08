import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';

import { groupStatusFilterOptions } from '../../community-admin.labels';
import { useAdminGroups } from '../../community-admin.queries';
import type { GroupStatus, OnCommunityAction } from '../../community-admin.types';
import { type GroupsFilters, useGroupsFilters } from '../../hooks/useGroupsFilters';
import styles from './GroupsSection.module.css';
import { GroupsTable } from './GroupsTable';

interface GroupsSectionProps {
  onAction: OnCommunityAction;
}

function SearchField({ filters }: { filters: GroupsFilters }) {
  return (
    <label className={styles.search}>
      <Icon name="search" size={16} />
      <input
        type="search"
        aria-label="Buscar grupo pelo nome"
        placeholder="Buscar grupo ou guilda"
        value={filters.search}
        onChange={(event) => filters.changeSearch(event.target.value)}
      />
    </label>
  );
}

function StatusFilter({ filters }: { filters: GroupsFilters }) {
  return (
    <label className={styles.statusFilter}>
      <Icon name="filterList" size={14} />
      <select
        aria-label="Filtrar por status"
        value={filters.status}
        onChange={(event) => filters.changeStatus(event.target.value as GroupStatus | '')}
      >
        {groupStatusFilterOptions.map(({ value, label }) => (
          <option key={label} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function GroupsToolbar({ filters }: { filters: GroupsFilters }) {
  return (
    <div className={styles.toolbar} role="search">
      <SearchField filters={filters} />
      <StatusFilter filters={filters} />
    </div>
  );
}

function GroupsHeading({ filters }: { filters: GroupsFilters }) {
  return (
    <header className={styles.heading}>
      <div>
        <h2 id="community-groups-title" className={styles.title}>
          Grupos &amp; Guildas Oficiais
        </h2>
        <p className={styles.subtitle}>
          Administre o status dos grupos da comunidade e as penalidades administrativas de canais.
        </p>
      </div>
      <GroupsToolbar filters={filters} />
    </header>
  );
}

function GroupsContent({ filters, onAction }: GroupsSectionProps & { filters: GroupsFilters }) {
  const query = useAdminGroups(filters.params);

  if (query.isPending) return <LoadingState message="Carregando os grupos…" />;
  if (query.isError) {
    return (
      <div className={styles.feedback}>
        <ErrorState message={query.error.message} />
        <Button variant="secondary" onClick={() => void query.refetch()}>
          Tentar de novo
        </Button>
      </div>
    );
  }
  if (query.data.data.length === 0) return <EmptyState title="Nenhum grupo encontrado" />;

  const { page, totalPages } = query.data.meta;
  return (
    <>
      <GroupsTable groups={query.data.data} onAction={onAction} />
      <Pagination page={page} totalPages={totalPages} onPageChange={filters.changePage} />
    </>
  );
}

export function GroupsSection({ onAction }: GroupsSectionProps) {
  const filters = useGroupsFilters();

  return (
    <section className={styles.section} aria-labelledby="community-groups-title">
      <GroupsHeading filters={filters} />
      <GroupsContent filters={filters} onAction={onAction} />
    </section>
  );
}
