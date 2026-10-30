import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { installFakeGoogleIdentity } from '@/test/fakeGoogleIdentity';
import { renderWithProviders } from '@/test/renderWithProviders';

import { authApi } from '../../auth.api';
import { LoginPanel } from './LoginPanel';

vi.mock('@/config/env', () => ({
  env: { API_URL: 'http://localhost:3000', GOOGLE_CLIENT_ID: 'cliente.apps' },
}));
vi.mock('../../auth.api', () => ({ authApi: { login: vi.fn(), loginWithGoogle: vi.fn() } }));

const routes = [
  { path: paths.login, element: <LoginPanel /> },
  { path: paths.profile, element: <p>Home do cliente</p> },
];

describe('LoginPanel com Google', () => {
  afterEach(() => {
    delete window.google;
  });

  it('CA9: entra pela API com o id_token e o "lembrar de mim" do formulário', async () => {
    const google = installFakeGoogleIdentity();
    vi.mocked(authApi.loginWithGoogle).mockResolvedValue({
      accessToken: 'token',
      user: { id: 'user-1', name: 'Ana', role: 'CUSTOMER' },
    });
    renderWithProviders({ routes, initialPath: paths.login });
    await waitFor(() => expect(google.initialize).toHaveBeenCalled());

    await userEvent.click(screen.getByLabelText('Lembrar de mim por 30 dias'));
    await act(async () => {
      google.signInWith('id-token-do-google');
      await Promise.resolve();
    });

    expect(await screen.findByText('Home do cliente')).toBeInTheDocument();
    expect(vi.mocked(authApi.loginWithGoogle).mock.calls[0]?.[0]).toEqual({
      idToken: 'id-token-do-google',
      rememberMe: true,
    });
  });
});
