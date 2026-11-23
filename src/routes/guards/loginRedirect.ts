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

const PENDING_REDIRECT_KEY = 'cromocard:redirect-after-login';

export function rememberRedirectAfterLogin(path: string): void {
  try {
    sessionStorage.setItem(PENDING_REDIRECT_KEY, path);
  } catch {
    return;
  }
}

function pendingRedirect(): string | null {
  try {
    return sessionStorage.getItem(PENDING_REDIRECT_KEY);
  } catch {
    return null;
  }
}

export function forgetRedirectAfterLogin(): void {
  try {
    sessionStorage.removeItem(PENDING_REDIRECT_KEY);
  } catch {
    return;
  }
}

export function pathAfterLogin(search: string, role: UserRole): string {
  const requested = new URLSearchParams(search).get(REDIRECT_PARAM) ?? pendingRedirect();
  return isInternalPath(requested) ? requested : homePathByRole[role];
}
