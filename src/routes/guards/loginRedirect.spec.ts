import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  forgetRedirectAfterLogin,
  pathAfterLogin,
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
