import type { GroupStatus } from './community-admin.types';

export const groupStatusLabels: Record<GroupStatus, string> = {
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
};

export const groupStatusFilterOptions: { value: GroupStatus | ''; label: string }[] = [
  { value: '', label: 'Status: Todos' },
  { value: 'ACTIVE', label: 'Status: Ativo' },
  { value: 'SUSPENDED', label: 'Status: Suspenso' },
];
