import type { UserRole } from '@/types/authenticated-user';

export const paths = {
  home: '/',
  login: '/login',
  register: '/cadastro',
  forgotPassword: '/esqueci-senha',
  checkEmail: '/confirme-seu-email',
  verifyEmail: '/confirmar-email',
  profile: '/profile',
  backoffice: {
    root: '/backoffice',
    dashboard: '/backoffice/dashboard',
    users: '/backoffice/users',
    notifications: '/backoffice/notifications',
    catalog: '/backoffice/catalog',
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

export function checkEmailPathFor(email: string): string {
  return `${paths.checkEmail}?${new URLSearchParams({ email }).toString()}`;
}
