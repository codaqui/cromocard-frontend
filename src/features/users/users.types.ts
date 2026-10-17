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
