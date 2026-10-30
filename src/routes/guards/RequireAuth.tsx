import { Navigate, Outlet, useLocation } from 'react-router';

import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';

import { loginPathFor } from './loginRedirect';

export function RequireAuth() {
  const { user, isRestoringSession, hasSignedOut } = useAuth();
  const location = useLocation();

  if (isRestoringSession) return <LoadingState message="Carregando sessão…" />;
  if (!user) return <Navigate to={hasSignedOut ? paths.home : loginPathFor(location)} replace />;

  return <Outlet />;
}
