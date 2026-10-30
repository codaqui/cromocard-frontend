import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { UserRole } from '@/types/authenticated-user';

import { authApi } from '../../auth.api';
import { LoginPanel } from './LoginPanel';

vi.mock('../../auth.api', () => ({ authApi: { login: vi.fn() } }));

const routes = [
  { path: paths.login, element: <LoginPanel /> },
  { path: paths.profile, element: <p>Home do cliente</p> },
  { path: paths.backoffice.dashboard, element: <p>BackOffice</p> },
  { path: '/colecao', element: <p>Página pedida antes do login</p> },
];

function sessionFor(role: UserRole) {
  return { accessToken: 'token', user: { id: 'user-1', name: 'Ana', role } };
}

function rejectWith(status: number, code: string, message: string) {
  vi.mocked(authApi.login).mockRejectedValue(new ApiError({ status, code, message }));
}

async function submitLogin() {
  await userEvent.type(screen.getByLabelText('E-mail'), 'ana@cromocard.dev');
  await userEvent.type(screen.getByLabelText('Senha'), 'Senha@Forte1');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar na Plataforma' }));
}

describe('LoginPanel', () => {
  beforeEach(() => {
    vi.mocked(authApi.login).mockReset();
  });

  it('CA1: entra e abre a home da área Cliente', async () => {
    vi.mocked(authApi.login).mockResolvedValue(sessionFor('CUSTOMER'));
    renderWithProviders({ routes, initialPath: paths.login });

    await submitLogin();

    expect(await screen.findByText('Home do cliente')).toBeInTheDocument();
    expect(vi.mocked(authApi.login).mock.calls[0]?.[0]).toEqual({
      email: 'ana@cromocard.dev',
      password: 'Senha@Forte1',
      rememberMe: false,
    });
  });

  it('CA3: o administrador vai para o BackOffice', async () => {
    vi.mocked(authApi.login).mockResolvedValue(sessionFor('ADMIN'));
    renderWithProviders({ routes, initialPath: paths.login });

    await submitLogin();

    expect(await screen.findByText('BackOffice')).toBeInTheDocument();
  });

  it('volta para a página protegida que a pessoa tentou abrir', async () => {
    vi.mocked(authApi.login).mockResolvedValue(sessionFor('CUSTOMER'));
    renderWithProviders({ routes, initialPath: `${paths.login}?redirect=/colecao` });

    await submitLogin();

    expect(await screen.findByText('Página pedida antes do login')).toBeInTheDocument();
  });

  it.each(['//site-malicioso.com', '/%5Csite-malicioso.com', 'https://site-malicioso.com'])(
    'ignora redirect para fora do app (%s)',
    async (redirect) => {
      vi.mocked(authApi.login).mockResolvedValue(sessionFor('CUSTOMER'));
      renderWithProviders({ routes, initialPath: `${paths.login}?redirect=${redirect}` });

      await submitLogin();

      expect(await screen.findByText('Home do cliente')).toBeInTheDocument();
    },
  );

  it('CA4: mostra "E-mail ou senha incorretos" vindo da API', async () => {
    rejectWith(401, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos');
    renderWithProviders({ routes, initialPath: paths.login });

    await submitLogin();

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos');
  });

  it('CA5: mostra o erro no campo e não chama a API com e-mail inválido e senha vazia', async () => {
    renderWithProviders({ routes, initialPath: paths.login });

    await userEvent.type(screen.getByLabelText('E-mail'), 'nao-e-email');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar na Plataforma' }));

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument();
    expect(screen.getByText('Informe a senha')).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('CA6: mostra a mensagem de conta suspensa', async () => {
    const message = 'Sua conta está suspensa. Entre em contato com o suporte.';
    rejectWith(403, 'ACCOUNT_SUSPENDED', message);
    renderWithProviders({ routes, initialPath: paths.login });

    await submitLogin();

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
  });

  it('CA7: mostra a mensagem de conta excluída', async () => {
    const message = 'Esta conta foi excluída. Você pode pedir a reativação.';
    rejectWith(403, 'ACCOUNT_DELETED', message);
    renderWithProviders({ routes, initialPath: paths.login });

    await submitLogin();

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
  });
});
