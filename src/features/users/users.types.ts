import type { PaginationParams } from '@/types/api';
import type { UserRole } from '@/types/authenticated-user';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  username: string | null;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface ListUsersParams extends PaginationParams {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface CreateUserByAdminInput {
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: UserRole;
}

export type UpdateUserByAdminInput = Partial<CreateUserByAdminInput>;
