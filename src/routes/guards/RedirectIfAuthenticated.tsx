import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useAuth } from '@/hooks/useAuth';

import { forgetRedirectAfterLogin, pathAfterLogin } from './loginRedirect';

export function RedirectIfAuthenticated() {
  const { user, isRestoringSession } = useAuth();
  const { search } = useLocation();

  useEffect(() => {
    if (user) forgetRedirectAfterLogin();
  }, [user]);

  if (isRestoringSession) return <LoadingState message="Carregando sessão…" />;
  if (user) return <Navigate to={pathAfterLogin(search, user.role)} replace />;

  return <Outlet />;
}
