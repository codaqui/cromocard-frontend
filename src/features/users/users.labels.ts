import type { UserRole } from '@/types/authenticated-user';

import type { UserStatus } from './users.types';

export const roleLabels: Record<UserRole, string> = {
  CUSTOMER: 'Cliente',
  SELLER: 'Vendedor',
  ADMIN: 'Administrador',
};

export const statusLabels: Record<UserStatus, string> = {
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
};
