export const USER_ROLES = ['CUSTOMER', 'SELLER', 'ADMIN'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}
