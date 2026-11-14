import { useId } from 'react';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { Icon } from '@/components/Icon/Icon';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Pagination } from '@/components/Pagination/Pagination';

import { groupStatusFilterOptions } from '../../community-admin.labels';
import { GROUP_NAME_MAX_LENGTH } from '../../community-admin.schemas';
import { useAdminGroups } from '../../community-admin.queries';
import type { GroupStatus, OnCommunityAction } from '../../community-admin.types';
import { type GroupsFilters, useGroupsFilters } from '../../hooks/useGroupsFilters';
import { RetryableError } from '../RetryableError/RetryableError';
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
        maxLength={GROUP_NAME_MAX_LENGTH}
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

function GroupsHeading({ filters, titleId }: { filters: GroupsFilters; titleId: string }) {
  return (
    <header className={styles.heading}>
      <div>
        <h2 id={titleId} className={styles.title}>
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
    return <RetryableError message={query.error.message} onRetry={() => void query.refetch()} />;
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
  const titleId = useId();

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <GroupsHeading filters={filters} titleId={titleId} />
      <GroupsContent filters={filters} onAction={onAction} />
    </section>
  );
}
