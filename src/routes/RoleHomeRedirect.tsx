import { Navigate } from 'react-router';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useAuth } from '@/hooks/useAuth';
import { homePathByRole } from '@/routes/paths';

export function RoleHomeRedirect() {
  const { user, isRestoringSession } = useAuth();

  if (isRestoringSession) return <LoadingState message="Carregando sessão…" />;
  if (user) return <Navigate to={homePathByRole[user.role]} replace />;

  return (
    <EmptyState
      title="Bem-vindo ao CromoCard"
      message="Entre na sua conta para acessar sua coleção."
    />
  );
}
