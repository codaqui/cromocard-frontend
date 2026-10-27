import { useLocation, useNavigate } from 'react-router';

import { pathAfterLogin } from '@/routes/guards/loginRedirect';

import type { SessionUser } from '../auth.types';

export function useLoginRedirect() {
  const navigate = useNavigate();
  const { search } = useLocation();

  return ({ role }: Pick<SessionUser, 'role'>) => {
    void navigate(pathAfterLogin(search, role), { replace: true });
  };
}
