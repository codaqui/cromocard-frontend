import { useLocation, useNavigate } from 'react-router';

import { forgetRedirectAfterLogin, pathAfterLogin } from '@/routes/guards/loginRedirect';

import type { SessionUser } from '../auth.types';

export function useLoginRedirect() {
  const navigate = useNavigate();
  const { search } = useLocation();

  return ({ role }: Pick<SessionUser, 'role'>) => {
    const target = pathAfterLogin(search, role);
    forgetRedirectAfterLogin();
    void navigate(target, { replace: true });
  };
}
