import { Navigate, Outlet, useLocation } from 'react-router';

import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useAuth } from '@/hooks/useAuth';
import { homePathByRole, paths } from '@/routes/paths';
import type { UserRole } from '@/types/authenticated-user';

import { loginPathFor } from './loginRedirect';

interface RequireRoleProps {
  role: UserRole;
}

export function RequireRole({ role }: RequireRoleProps) {
  const { user, isRestoringSession, hasSignedOut } = useAuth();
  const location = useLocation();

  if (isRestoringSession) return <LoadingState message="Carregando sessão…" />;
  if (!user) return <Navigate to={hasSignedOut ? paths.home : loginPathFor(location)} replace />;
  if (user.role !== role) return <Navigate to={homePathByRole[user.role]} replace />;

  return <Outlet />;
}
