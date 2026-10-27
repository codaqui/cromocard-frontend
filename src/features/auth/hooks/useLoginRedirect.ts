import { useNavigate, useSearchParams } from 'react-router';

import { homePathByRole } from '@/routes/paths';

import type { SessionUser } from '../auth.types';

export const REDIRECT_PARAM = 'redirect';

function isInternalPath(path: string | null): path is string {
  return Boolean(path?.startsWith('/') && !path.startsWith('//'));
}

export function useLoginRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return ({ role }: Pick<SessionUser, 'role'>) => {
    const requested = searchParams.get(REDIRECT_PARAM);
    void navigate(isInternalPath(requested) ? requested : homePathByRole[role], { replace: true });
  };
}
