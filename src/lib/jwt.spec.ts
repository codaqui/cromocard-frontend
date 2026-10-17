import { describe, expect, it } from 'vitest';

import { decodeAccessToken } from '@/lib/jwt';

const ONE_HOUR_IN_SECONDS = 60 * 60;

function encodeBase64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildToken(payload: object): string {
  return `${encodeBase64Url({ alg: 'HS256', typ: 'JWT' })}.${encodeBase64Url(payload)}.assinatura`;
}

function secondsFromNow(seconds: number): number {
  return Math.floor(Date.now() / 1000) + seconds;
}

describe('decodeAccessToken', () => {
  it('extrai o id e o papel do usuário', () => {
    const token = buildToken({
      sub: 'user-1',
      role: 'ADMIN',
      exp: secondsFromNow(ONE_HOUR_IN_SECONDS),
    });

    expect(decodeAccessToken(token)).toEqual({ id: 'user-1', role: 'ADMIN' });
  });

  it('retorna null para token expirado', () => {
    const token = buildToken({ sub: 'user-1', role: 'ADMIN', exp: secondsFromNow(-1) });

    expect(decodeAccessToken(token)).toBeNull();
  });

  it('retorna null para papel desconhecido', () => {
    const token = buildToken({
      sub: 'user-1',
      role: 'ROOT',
      exp: secondsFromNow(ONE_HOUR_IN_SECONDS),
    });

    expect(decodeAccessToken(token)).toBeNull();
  });

  it('retorna null para valor que não é JWT', () => {
    expect(decodeAccessToken('nao-e-um-jwt')).toBeNull();
  });
});
