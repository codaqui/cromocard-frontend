import type { UserRole } from '@/types/authenticated-user';

const ONE_HOUR_IN_SECONDS = 60 * 60;

function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fakeAccessToken(role: UserRole, sub = 'user-1'): string {
  const exp = Math.floor(Date.now() / 1000) + ONE_HOUR_IN_SECONDS;
  return `${base64Url({ alg: 'HS256' })}.${base64Url({ sub, role, exp })}.assinatura`;
}
