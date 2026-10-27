import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { accessTokenStore } from '@/lib/access-token';
import { api, http, onUnauthorized, setSessionRefresher } from '@/lib/http';

type Responder = (config: InternalAxiosRequestConfig) => { status: number; data: unknown };

function respond(config: InternalAxiosRequestConfig, status: number, data: unknown) {
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  if (status < 400) return Promise.resolve(response);
  return Promise.reject(new AxiosError('falhou', 'ERR_BAD_REQUEST', config, null, response));
}

function useFakeApi(responder: Responder) {
  http.defaults.adapter = (config) => {
    const { status, data } = responder(config);
    return respond(config, status, data);
  };
}

function bearerOf(config: InternalAxiosRequestConfig): string {
  return AxiosHeaders.from(config.headers).get('Authorization')?.toString() ?? '';
}

const unauthorized = { status: 401, data: { error: 'UNAUTHORIZED', message: 'Token expirado' } };

function meRespondsOnlyTo(token: string): Responder {
  return (config) =>
    bearerOf(config) === `Bearer ${token}`
      ? { status: 200, data: { data: { id: 'user-1' } } }
      : unauthorized;
}

describe('http', () => {
  const originalAdapter = http.defaults.adapter;

  beforeEach(() => accessTokenStore.set('token-expirado'));

  afterEach(() => {
    http.defaults.adapter = originalAdapter;
    accessTokenStore.set(null);
  });

  it('envia o access token no Authorization e o cookie com withCredentials', async () => {
    let sent: InternalAxiosRequestConfig | undefined;
    useFakeApi((config) => {
      sent = config;
      return { status: 200, data: { data: null } };
    });

    await api.get('/users/me');

    expect(bearerOf(sent as InternalAxiosRequestConfig)).toBe('Bearer token-expirado');
    expect(sent?.withCredentials).toBe(true);
  });

  it('CA17: num 401, renova o token e repete a requisição com o token novo', async () => {
    useFakeApi(meRespondsOnlyTo('token-novo'));
    const refresher = vi.fn(() => {
      accessTokenStore.set('token-novo');
      return Promise.resolve(true);
    });
    const stop = setSessionRefresher(refresher);

    await expect(api.get('/users/me')).resolves.toEqual({ id: 'user-1' });
    expect(refresher).toHaveBeenCalledOnce();
    stop();
  });

  it('CA17: várias requisições com 401 ao mesmo tempo fazem uma renovação só', async () => {
    useFakeApi(meRespondsOnlyTo('token-novo'));
    const refresher = vi.fn(async () => {
      await Promise.resolve();
      accessTokenStore.set('token-novo');
      return true;
    });
    const stop = setSessionRefresher(refresher);

    await Promise.all([api.get('/users/me'), api.get('/users/me'), api.get('/users/me')]);

    expect(refresher).toHaveBeenCalledOnce();
    stop();
  });

  it('encerra a sessão quando a renovação falha', async () => {
    useFakeApi(() => unauthorized);
    const listener = vi.fn();
    const stopListening = onUnauthorized(listener);
    const stop = setSessionRefresher(() => Promise.resolve(false));

    await expect(api.get('/users/me')).rejects.toMatchObject({ status: 401 });
    expect(listener).toHaveBeenCalledOnce();
    stop();
    stopListening();
  });

  it('não tenta renovar quando o 401 vem de uma rota de autenticação', async () => {
    useFakeApi(() => ({
      status: 401,
      data: { error: 'INVALID_CREDENTIALS', message: 'E-mail ou senha incorretos' },
    }));
    const refresher = vi.fn(() => Promise.resolve(true));
    const stop = setSessionRefresher(refresher);

    await expect(api.post('/auth/login', {})).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
    expect(refresher).not.toHaveBeenCalled();
    stop();
  });
});
