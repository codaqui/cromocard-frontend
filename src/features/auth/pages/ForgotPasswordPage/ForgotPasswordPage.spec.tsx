import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { authApi } from '../../auth.api';
import { ForgotPasswordPage } from './ForgotPasswordPage';

vi.mock('../../auth.api', () => ({ authApi: { forgotPassword: vi.fn() } }));

function renderPage() {
  renderWithProviders({
    routes: [{ path: paths.forgotPassword, element: <ForgotPasswordPage /> }],
    initialPath: paths.forgotPassword,
  });
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.mocked(authApi.forgotPassword).mockReset();
  });

  it('CA1/CA2: envia o e-mail e mostra a confirmação genérica', async () => {
    vi.mocked(authApi.forgotPassword).mockResolvedValue(undefined);
    renderPage();

    await userEvent.type(screen.getByLabelText('E-mail'), ' Ana@CromoCard.dev ');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link de redefinição' }));

    expect(await screen.findByRole('heading', { name: 'Confira seu e-mail' })).toBeInTheDocument();
    expect(screen.getByText(/Se houver uma conta com esse e-mail/)).toBeInTheDocument();
    expect(vi.mocked(authApi.forgotPassword).mock.calls[0]?.[0]).toEqual({
      email: 'ana@cromocard.dev',
    });
  });

  it('CA3: e-mail em formato inválido mostra o erro no campo e não envia', async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText('E-mail'), 'nao-e-email');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link de redefinição' }));

    expect(await screen.findByText('Informe um e-mail válido')).toBeInTheDocument();
    expect(authApi.forgotPassword).not.toHaveBeenCalled();
  });

  it('CA10: desabilita o botão enquanto envia', async () => {
    vi.mocked(authApi.forgotPassword).mockReturnValue(new Promise(() => undefined));
    renderPage();

    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@cromocard.dev');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link de redefinição' }));

    expect(await screen.findByRole('button', { name: 'Enviando…' })).toBeDisabled();
  });
});
