import { Navigate, Outlet } from 'react-router';

import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useAuth } from '@/hooks/useAuth';
import { homePathByRole } from '@/routes/paths';

export function RedirectIfAuthenticated() {
  const { user, isRestoringSession } = useAuth();

  if (isRestoringSession) return <LoadingState message="Carregando sessão…" />;
  if (user) return <Navigate to={homePathByRole[user.role]} replace />;

  return <Outlet />;
}
