import type { BadgeTone } from '@/components/Badge/Badge';
import type { IconName } from '@/components/Icon/icon-paths';
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

export const roleTones: Record<UserRole, BadgeTone> = {
  CUSTOMER: 'neutral',
  SELLER: 'neutral',
  ADMIN: 'info',
};

export const statusLabels: Record<UserStatus, string> = {
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
};

export const statusTones: Record<UserStatus, BadgeTone> = {
  ACTIVE: 'success',
  SUSPENDED: 'danger',
};

export interface ToggleStatusCopy {
  label: string;
  icon: IconName;
}

export function toggleStatusCopyFor(status: UserStatus): ToggleStatusCopy {
  return status === 'ACTIVE'
    ? { label: 'Suspender', icon: 'pause' }
    : { label: 'Reativar', icon: 'playArrow' };
}

export const userActionMessages = {
  created: 'Usuário cadastrado com sucesso.',
  updated: 'Usuário atualizado com sucesso.',
  suspended: 'Usuário suspenso com sucesso.',
  reactivated: 'Usuário reativado com sucesso.',
  removed: 'Usuário excluído com sucesso.',
  activationResent: 'Link de ativação reenviado com sucesso.',
} as const;
