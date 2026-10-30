import { Navigate, Outlet, useLocation } from 'react-router';

import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useAuth } from '@/hooks/useAuth';

import { pathAfterLogin } from './loginRedirect';

export function RedirectIfAuthenticated() {
  const { user, isRestoringSession } = useAuth();
  const { search } = useLocation();

  if (isRestoringSession) return <LoadingState message="Carregando sessão…" />;
  if (user) return <Navigate to={pathAfterLogin(search, user.role)} replace />;

  return <Outlet />;
}
