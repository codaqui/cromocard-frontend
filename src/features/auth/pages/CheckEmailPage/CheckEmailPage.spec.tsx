import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { authApi } from '../../auth.api';
import { CheckEmailPage } from './CheckEmailPage';

vi.mock('../../auth.api', () => ({ authApi: { resendVerification: vi.fn() } }));

describe('CheckEmailPage', () => {
  it('CA2: mostra para onde o link foi enviado', async () => {
    renderWithProviders({
      routes: [{ path: paths.checkEmail, element: <CheckEmailPage /> }],
      initialPath: `${paths.checkEmail}?email=ana%40cromocard.dev`,
    });

    expect(await screen.findByRole('heading', { name: 'Confirme seu e-mail' })).toBeInTheDocument();
    expect(screen.getByText('ana@cromocard.dev')).toBeInTheDocument();
  });

  it('CA10: reenvia o e-mail de confirmação para o endereço informado', async () => {
    vi.mocked(authApi.resendVerification).mockResolvedValue(undefined);
    renderWithProviders({
      routes: [{ path: paths.checkEmail, element: <CheckEmailPage /> }],
      initialPath: `${paths.checkEmail}?email=ana%40cromocard.dev`,
    });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Reenviar e-mail de confirmação' }),
    );

    expect(vi.mocked(authApi.resendVerification).mock.calls[0]?.[0]).toEqual({
      email: 'ana@cromocard.dev',
    });
    expect(await screen.findByRole('status')).toHaveTextContent('enviamos um novo link');
  });
});
