import type { PaginationParams } from '@/types/api';
import type { UserRole } from '@/types/authenticated-user';

export const USER_STATUSES = ['ACTIVE', 'SUSPENDED'] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  username: string | null;
  phone: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
}

export interface ListUsersParams extends PaginationParams {
  q?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UserAddress {
  id: string;
  label: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  isPrimary: boolean;
}

export const ADMIN_ACTIONS = [
  'USER_CREATED',
  'USER_UPDATED',
  'USER_SUSPENDED',
  'USER_REACTIVATED',
  'USER_DELETED',
  'USER_ACTIVATION_RESENT',
] as const;

export type AdminAction = (typeof ADMIN_ACTIONS)[number];

export interface AdminActionEntry {
  id: string;
  action: AdminAction;
  reason: string | null;
  admin: { id: string; name: string };
  createdAt: string;
}

/** A lista não traz o CPF: ele só vem no detalhe (GET /users/:id), junto com a situação da ativação. */
export interface UserDetail extends UserSummary {
  cpf: string | null;
  oauthProvider: string | null;
  /** Conta criada pelo admin que ainda não definiu senha nem entrou com o Google (R15). */
  activationPending: boolean;
  addresses: UserAddress[];
  adminActions: AdminActionEntry[];
}

/** O modal de edição abre pela lista (resumo) ou pelo detalhe (com CPF e situação da ativação). */
export type EditableUser = UserSummary | UserDetail;
