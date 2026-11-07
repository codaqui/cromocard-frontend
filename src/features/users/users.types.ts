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
}

export interface ListUsersParams extends PaginationParams {
  q?: string;
  role?: UserRole;
  status?: UserStatus;
}
