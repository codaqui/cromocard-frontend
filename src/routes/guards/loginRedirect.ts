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

export const PENDING_REDIRECT_KEY = 'cromocard:redirect-after-login';
export const PENDING_REDIRECT_MAX_AGE_MS = 30 * 60 * 1000;

interface PendingRedirect {
  path: string;
  savedAt: number;
}

function withSessionStorage<T>(action: (storage: Storage) => T, fallbackWhenBlocked: T): T {
  try {
    return action(sessionStorage);
  } catch {
    return fallbackWhenBlocked;
  }
}

export function rememberRedirectAfterLogin(path: string): void {
  const pending: PendingRedirect = { path, savedAt: Date.now() };
  withSessionStorage(
    (storage) => storage.setItem(PENDING_REDIRECT_KEY, JSON.stringify(pending)),
    undefined,
  );
}

function isFresh(pending: Partial<PendingRedirect>): pending is PendingRedirect {
  const age = Date.now() - (pending.savedAt ?? 0);
  return typeof pending.path === 'string' && age <= PENDING_REDIRECT_MAX_AGE_MS;
}

function pendingRedirect(): string | null {
  return withSessionStorage((storage) => {
    const pending = JSON.parse(
      storage.getItem(PENDING_REDIRECT_KEY) ?? '{}',
    ) as Partial<PendingRedirect> | null;
    return pending && isFresh(pending) ? pending.path : null;
  }, null);
}

export function forgetRedirectAfterLogin(): void {
  withSessionStorage((storage) => storage.removeItem(PENDING_REDIRECT_KEY), undefined);
}

export function pathAfterLogin(search: string, role: UserRole): string {
  const requested = new URLSearchParams(search).get(REDIRECT_PARAM) ?? pendingRedirect();
  return isInternalPath(requested) ? requested : homePathByRole[role];
}
