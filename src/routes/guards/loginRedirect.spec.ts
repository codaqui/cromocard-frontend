import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  forgetRedirectAfterLogin,
  pathAfterLogin,
  PENDING_REDIRECT_KEY,
  PENDING_REDIRECT_MAX_AGE_MS,
  rememberRedirectAfterLogin,
} from './loginRedirect';

describe('pathAfterLogin', () => {
  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('prefere o redirect da URL', () => {
    rememberRedirectAfterLogin('/cartas/2');

    expect(pathAfterLogin('?redirect=%2Fcartas%2F1', 'CUSTOMER')).toBe('/cartas/1');
  });

  it('L16: sem redirect na URL, volta para a página guardada antes do cadastro', () => {
    rememberRedirectAfterLogin('/cartas/2');

    expect(pathAfterLogin('', 'CUSTOMER')).toBe('/cartas/2');
  });

  it('L16: descarta a página guardada há mais de 30 minutos', () => {
    vi.spyOn(Date, 'now').mockReturnValue(0);
    rememberRedirectAfterLogin('/cartas/2');
    vi.spyOn(Date, 'now').mockReturnValue(PENDING_REDIRECT_MAX_AGE_MS + 1);

    expect(pathAfterLogin('', 'CUSTOMER')).toBe('/profile');
  });

  it('ignora valor guardado em formato inválido', () => {
    sessionStorage.setItem(PENDING_REDIRECT_KEY, 'null');

    expect(pathAfterLogin('', 'CUSTOMER')).toBe('/profile');
  });

  it('esquece a página guardada e cai no destino do papel', () => {
    rememberRedirectAfterLogin('/cartas/2');
    forgetRedirectAfterLogin();

    expect(pathAfterLogin('', 'CUSTOMER')).toBe('/profile');
  });

  it('ignora endereço externo guardado', () => {
    rememberRedirectAfterLogin('https://outro.site');

    expect(pathAfterLogin('', 'ADMIN')).toBe('/backoffice/dashboard');
  });

  it('segue funcionando quando o navegador bloqueia o sessionStorage', () => {
    const blocked = () => {
      throw new Error('bloqueado');
    };
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(blocked);

    expect(() => rememberRedirectAfterLogin('/cartas/2')).not.toThrow();
    expect(() => forgetRedirectAfterLogin()).not.toThrow();
    expect(pathAfterLogin('', 'CUSTOMER')).toBe('/profile');
  });
});
