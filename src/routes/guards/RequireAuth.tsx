import { Navigate, Outlet, useLocation } from 'react-router';

import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useAuth } from '@/hooks/useAuth';

import { loginPathFor } from './loginRedirect';

export function RequireAuth() {
  const { user, isRestoringSession } = useAuth();
  const location = useLocation();

  if (isRestoringSession) return <LoadingState message="Carregando sessão…" />;
  if (!user) return <Navigate to={loginPathFor(location)} replace />;

  return <Outlet />;
}
