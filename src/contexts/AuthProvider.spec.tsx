import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@/contexts/AuthProvider';
import { authApi } from '@/features/auth';
import { useAuth } from '@/hooks/useAuth';
import { accessTokenStore } from '@/lib/access-token';
import { fakeAccessToken } from '@/test/fakeAccessToken';

vi.mock('@/features/auth', () => ({
  authApi: { refresh: vi.fn(), logout: vi.fn() },
}));

function SessionProbe() {
  const { user, isRestoringSession, signOut } = useAuth();

  if (isRestoringSession) return <p>Restaurando sessão</p>;

  return (
    <>
      <p>{user ? `Logado como ${user.role}` : 'Sem sessão'}</p>
      <button type="button" onClick={signOut}>
        Sair
      </button>
    </>
  );
}

function renderProvider(queryClient = new QueryClient()) {
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>
    </QueryClientProvider>,
  );
  return queryClient;
}

const adminSession = {
  accessToken: fakeAccessToken('ADMIN'),
  user: { id: 'user-1', name: 'Admin', role: 'ADMIN' as const },
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.mocked(authApi.refresh).mockReset();
    vi.mocked(authApi.logout).mockReset().mockResolvedValue(undefined);
    accessTokenStore.set(null);
    localStorage.clear();
    sessionStorage.clear();
  });

  it('CA16: ao recarregar, renova pelo cookie e mantém a sessão sem usar o storage', async () => {
    vi.mocked(authApi.refresh).mockResolvedValue(adminSession);

    renderProvider();

    expect(screen.getByText('Restaurando sessão')).toBeInTheDocument();
    expect(await screen.findByText('Logado como ADMIN')).toBeInTheDocument();
    expect(accessTokenStore.get()).toBe(adminSession.accessToken);
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('começa sem sessão quando o cookie não renova', async () => {
    vi.mocked(authApi.refresh).mockRejectedValue(new Error('401'));

    renderProvider();

    expect(await screen.findByText('Sem sessão')).toBeInTheDocument();
  });

  it('CA15: o Sair revoga o refresh, apaga o access token da memória e limpa o cache', async () => {
    vi.mocked(authApi.refresh).mockResolvedValue(adminSession);
    const queryClient = new QueryClient();
    queryClient.setQueryData(['users', 'me'], { id: 'user-1' });
    renderProvider(queryClient);

    await userEvent.click(await screen.findByRole('button', { name: 'Sair' }));

    expect(await screen.findByText('Sem sessão')).toBeInTheDocument();
    expect(authApi.logout).toHaveBeenCalledOnce();
    expect(accessTokenStore.get()).toBeNull();
    await waitFor(() => expect(queryClient.getQueryData(['users', 'me'])).toBeUndefined());
  });
});
