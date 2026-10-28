import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { authApi } from '../../auth.api';
import { LoginPanel } from '../../components/LoginPanel/LoginPanel';
import { ResetPasswordPage } from './ResetPasswordPage';

vi.mock('../../auth.api', () => ({ authApi: { resetPassword: vi.fn(), login: vi.fn() } }));

const routes = [
  { path: paths.resetPassword, element: <ResetPasswordPage /> },
  { path: paths.login, element: <LoginPanel /> },
  { path: paths.forgotPassword, element: <p>Esqueci minha senha</p> },
];

function renderPage(search = '?token=token-do-link') {
  renderWithProviders({ routes, initialPath: `${paths.resetPassword}${search}` });
}

async function submitPasswords(password = 'Nova@Senha12', confirm = password) {
  await userEvent.type(screen.getByLabelText('Senha nova'), password);
  await userEvent.type(screen.getByLabelText('Confirmar senha nova'), confirm);
  await userEvent.click(screen.getByRole('button', { name: 'Salvar senha nova' }));
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.mocked(authApi.resetPassword).mockReset();
  });

  it('CA5: salva a senha nova com o token e leva ao login com "Senha alterada"', async () => {
    vi.mocked(authApi.resetPassword).mockResolvedValue(undefined);
    renderPage();

    await submitPasswords();

    expect(await screen.findByText('Senha alterada. Entre com a senha nova.')).toBeInTheDocument();
    expect(vi.mocked(authApi.resetPassword).mock.calls[0]?.[0]).toEqual({
      token: 'token-do-link',
      password: 'Nova@Senha12',
    });
  });

  it('CA6: link inválido, usado ou expirado oferece pedir um novo', async () => {
    vi.mocked(authApi.resetPassword).mockRejectedValue(
      new ApiError({ status: 400, code: 'INVALID_RESET_TOKEN', message: 'inválido' }),
    );
    renderPage();

    await submitPasswords();

    expect(
      await screen.findByRole('heading', { name: 'Link inválido ou expirado' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pedir um novo link' })).toHaveAttribute(
      'href',
      paths.forgotPassword,
    );
  });

  it('CA6: sem token no link, já mostra o link inválido', () => {
    renderPage('');

    expect(screen.getByRole('heading', { name: 'Link inválido ou expirado' })).toBeInTheDocument();
  });

  it('CA7: senha fora da regra ou diferente da confirmação não é enviada', async () => {
    renderPage();

    await submitPasswords('fraca', 'outra');

    expect(
      await screen.findByText('A senha precisa ter pelo menos 8 caracteres'),
    ).toBeInTheDocument();
    expect(screen.getByText('As senhas não são iguais')).toBeInTheDocument();
    expect(authApi.resetPassword).not.toHaveBeenCalled();
  });

  it('CA10: desabilita o botão enquanto salva', async () => {
    vi.mocked(authApi.resetPassword).mockReturnValue(new Promise(() => undefined));
    renderPage();

    await submitPasswords();

    expect(await screen.findByRole('button', { name: 'Salvando…' })).toBeDisabled();
  });
});
