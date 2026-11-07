import type { SelectOption } from '@/components/Select/Select';
import { USER_ROLES, type UserRole } from '@/types/authenticated-user';

import type { UserStatus } from './users.types';

export const roleLabels: Record<UserRole, string> = {
  CUSTOMER: 'Cliente',
  SELLER: 'Vendedor',
  ADMIN: 'Administrador',
};

export const roleSelectOptions: SelectOption[] = USER_ROLES.map((role) => ({
  value: role,
  label: roleLabels[role],
}));

export const statusLabels: Record<UserStatus, string> = {
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
};

export const userActionMessages = {
  created: 'Usuário cadastrado com sucesso.',
  updated: 'Usuário atualizado com sucesso.',
  suspended: 'Usuário suspenso com sucesso.',
  reactivated: 'Usuário reativado com sucesso.',
  removed: 'Usuário excluído com sucesso.',
} as const;
