import { useNavigate } from 'react-router';

import { useAuth } from '@/hooks/useAuth';
import { paths } from '@/routes/paths';

export function useSignOut(): () => void {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return () => {
    signOut();
    void navigate(paths.home, { replace: true });
  };
}
