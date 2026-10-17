import { Navigate, Outlet } from 'react-router';

import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';

export function RequireAuth() {
  const { user } = useAuth();

  if (!user) return <Navigate to={paths.home} replace />;

  return <Outlet />;
}
