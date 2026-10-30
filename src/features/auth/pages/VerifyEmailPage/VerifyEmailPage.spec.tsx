import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { authApi } from '../../auth.api';
import { LoginPanel } from '../../components/LoginPanel/LoginPanel';
import { VerifyEmailPage } from './VerifyEmailPage';

vi.mock('../../auth.api', () => ({
  authApi: { verifyEmail: vi.fn(), resendVerification: vi.fn(), login: vi.fn() },
}));

const routes = [
  { path: paths.verifyEmail, element: <VerifyEmailPage /> },
  { path: paths.login, element: <LoginPanel /> },
];

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.mocked(authApi.verifyEmail).mockReset();
    vi.mocked(authApi.resendVerification).mockReset();
  });

  it('CA8: confirma o e-mail e leva ao login com "E-mail confirmado"', async () => {
    vi.mocked(authApi.verifyEmail).mockResolvedValue(undefined);
    renderWithProviders({ routes, initialPath: `${paths.verifyEmail}?token=abc` });

    expect(await screen.findByText('E-mail confirmado. Agora é só entrar.')).toBeInTheDocument();
    expect(authApi.verifyEmail).toHaveBeenCalledOnce();
    expect(vi.mocked(authApi.verifyEmail).mock.calls[0]?.[0]).toEqual('abc');
  });

  it('CA9: link inválido mostra o erro e oferece o reenvio', async () => {
    vi.mocked(authApi.verifyEmail).mockRejectedValue(
      new ApiError({ status: 400, code: 'INVALID_VERIFICATION_TOKEN', message: 'inválido' }),
    );
    vi.mocked(authApi.resendVerification).mockResolvedValue(undefined);
    renderWithProviders({ routes, initialPath: `${paths.verifyEmail}?token=velho` });

    expect(
      await screen.findByRole('heading', { name: 'Link inválido ou expirado' }),
    ).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@cromocard.dev');
    await userEvent.click(screen.getByRole('button', { name: 'Reenviar e-mail de confirmação' }));

    expect(await screen.findByRole('status')).toHaveTextContent('enviamos um novo link');
    expect(vi.mocked(authApi.resendVerification).mock.calls[0]?.[0]).toEqual({
      email: 'ana@cromocard.dev',
    });
  });

  it('sem token mostra o link inválido sem chamar a API', async () => {
    renderWithProviders({ routes, initialPath: paths.verifyEmail });

    expect(
      await screen.findByRole('heading', { name: 'Link inválido ou expirado' }),
    ).toBeInTheDocument();
    expect(authApi.verifyEmail).not.toHaveBeenCalled();
  });

  it('falha que não é de link (rede, 500) mostra o erro, sem dizer que o link venceu', async () => {
    vi.mocked(authApi.verifyEmail).mockRejectedValue(
      new ApiError({ status: 500, code: 'INTERNAL_ERROR', message: 'Erro inesperado.' }),
    );
    renderWithProviders({ routes, initialPath: `${paths.verifyEmail}?token=abc` });

    expect(await screen.findByText('Erro inesperado.')).toBeInTheDocument();
    expect(screen.queryByText('Link inválido ou expirado')).not.toBeInTheDocument();
  });
});
