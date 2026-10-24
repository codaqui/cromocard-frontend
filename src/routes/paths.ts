import type { UserRole } from '@/types/authenticated-user';

export const paths = {
  home: '/',
  profile: '/profile',
  backoffice: {
    root: '/backoffice',
    dashboard: '/backoffice/dashboard',
    users: '/backoffice/users',
  },
} as const;

export const homePathByRole: Record<UserRole, string> = {
  CUSTOMER: paths.profile,
  SELLER: paths.profile,
  ADMIN: paths.backoffice.users,
};
