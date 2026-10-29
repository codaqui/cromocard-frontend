import type { Location } from 'react-router';

import { homePathByRole, paths } from '@/routes/paths';
import type { UserRole } from '@/types/authenticated-user';

export const REDIRECT_PARAM = 'redirect';

export function loginPathFor({ pathname, search }: Pick<Location, 'pathname' | 'search'>): string {
  const params = new URLSearchParams({ [REDIRECT_PARAM]: `${pathname}${search}` });
  return `${paths.login}?${params.toString()}`;
}

function isInternalPath(path: string | null): path is string {
  if (!path?.startsWith('/')) return false;
  const { origin } = window.location;
  return new URL(path, origin).origin === origin && !path.includes('\\');
}

export function pathAfterLogin(search: string, role: UserRole): string {
  const requested = new URLSearchParams(search).get(REDIRECT_PARAM);
  return isInternalPath(requested) ? requested : homePathByRole[role];
}
