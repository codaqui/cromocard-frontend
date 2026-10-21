import type { UserRole } from '@/types/authenticated-user';

export const paths = {
  home: '/',
  login: '/login',
  setupPassword: '/password/setup',
  profile: '/profile',
  backoffice: {
    root: '/backoffice',
    dashboard: '/backoffice/dashboard',
    users: '/backoffice/users',
    notifications: '/backoffice/notifications',
    catalog: '/backoffice/catalog',
    albums: '/backoffice/catalog/albums',
    communities: '/backoffice/communities',
    reports: '/backoffice/reports',
    requests: '/backoffice/requests',
    auditLogs: '/backoffice/audit-logs',
    settings: '/backoffice/settings',
  },
} as const;

export const homePathByRole: Record<UserRole, string> = {
  CUSTOMER: paths.profile,
  SELLER: paths.profile,
  ADMIN: paths.backoffice.dashboard,
};
