import { Navigate, Outlet } from 'react-router';

import { useAuth } from '@/hooks/useAuth';
import { homePathByRole, paths } from '@/routes/paths';
import type { UserRole } from '@/types/authenticated-user';

interface RequireRoleProps {
  role: UserRole;
}

export function RequireRole({ role }: RequireRoleProps) {
  const { user } = useAuth();

  if (!user) return <Navigate to={paths.home} replace />;
  if (user.role !== role) return <Navigate to={homePathByRole[user.role]} replace />;

  return <Outlet />;
}
