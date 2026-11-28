import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadEnv() {
  vi.resetModules();
  return import('./env');
}

describe('env', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.__ENV__;
  });

  it('usa as variáveis VITE_ no ambiente local', async () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');

    const { env } = await loadEnv();

    expect(env).toEqual({
      API_URL: 'http://localhost:3000',
      WS_URL: 'http://localhost:3001',
      SUPPORT_EMAIL: 'suporte@cromocard.dev',
    });
  });

  it('recusa subir sem a URL do ws, nem no env.js nem na VITE_WS_URL', async () => {
    vi.stubEnv('VITE_WS_URL', undefined);

    await expect(loadEnv()).rejects.toThrow(/WS_URL/);
  });

  it('prefere o env.js do container, aceita wss:// e tira a barra final das URLs', async () => {
    window.__ENV__ = {
      API_URL: 'https://api.cromocard.com.br/',
      WS_URL: 'wss://ws.cromocard.com.br/',
      GOOGLE_CLIENT_ID: 'cliente.apps.googleusercontent.com',
    };

    const { env } = await loadEnv();

    expect(env).toEqual({
      API_URL: 'https://api.cromocard.com.br',
      WS_URL: 'wss://ws.cromocard.com.br',
      GOOGLE_CLIENT_ID: 'cliente.apps.googleusercontent.com',
      SUPPORT_EMAIL: 'suporte@cromocard.dev',
    });
  });

  it('CA4: usa o e-mail do suporte do env.js', async () => {
    window.__ENV__ = { SUPPORT_EMAIL: 'ajuda@cromocard.com.br' };

    const { env } = await loadEnv();

    expect(env.SUPPORT_EMAIL).toBe('ajuda@cromocard.com.br');
  });

  it('recusa um e-mail do suporte inválido', async () => {
    window.__ENV__ = { SUPPORT_EMAIL: 'não é e-mail' };

    await expect(loadEnv()).rejects.toThrow(/SUPPORT_EMAIL/);
  });

  it('usa a VITE_WS_URL e a VITE_GOOGLE_CLIENT_ID quando o env.js não traz', async () => {
    vi.stubEnv('VITE_WS_URL', 'http://192.168.0.10:3001');
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'local.apps.googleusercontent.com');
    window.__ENV__ = { GOOGLE_CLIENT_ID: '' };

    const { env } = await loadEnv();

    expect(env.WS_URL).toBe('http://192.168.0.10:3001');
    expect(env.GOOGLE_CLIENT_ID).toBe('local.apps.googleusercontent.com');
  });

  it('recusa uma URL do ws inválida', async () => {
    window.__ENV__ = { WS_URL: 'não é url' };

    await expect(loadEnv()).rejects.toThrow(/WS_URL/);
  });
});
