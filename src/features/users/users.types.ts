import type { PaginationParams } from '@/types/api';
import type { UserRole } from '@/types/authenticated-user';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
}

export interface ListUsersParams extends PaginationParams {
  search?: string;
}

export const usersErrorCodes = {
  emailAlreadyRegistered: 'EMAIL_ALREADY_REGISTERED',
  cannotChangeOwnRole: 'CANNOT_CHANGE_OWN_ROLE',
  lastAdmin: 'LAST_ADMIN',
  cannotSuspendSelf: 'CANNOT_SUSPEND_SELF',
  alreadySuspended: 'ALREADY_SUSPENDED',
  notSuspended: 'NOT_SUSPENDED',
  cannotDeleteSelf: 'CANNOT_DELETE_SELF',
} as const;

export type UsersErrorCode = (typeof usersErrorCodes)[keyof typeof usersErrorCodes];
