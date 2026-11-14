import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usersApi } from './users.api';
import { useDeleteMe, useMe, usersKeys, useUpdateMe } from './users.queries';
import type { UserSummary } from './users.types';

vi.mock('./users.api', () => ({
  usersApi: {
    getMe: vi.fn(),
    updateMe: vi.fn(),
    deleteMe: vi.fn(),
  },
}));

function buildUser(overrides: Partial<UserSummary> = {}): UserSummary {
  return {
    id: 'user-1',
    name: 'Ana Colecionadora',
    email: 'ana@cromocard.dev',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    emailVerified: true,
    createdAt: '2026-10-01T00:00:00.000Z',
    username: null,
    phone: null,
    lastLoginAt: null,
    lastLoginIp: null,
    ...overrides,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('usersKeys', () => {
  it('a chave de perfil é estável', () => {
    expect(usersKeys.me()).toEqual(['users', 'me']);
  });
});

describe('useMe', () => {
  beforeEach(() => {
    vi.mocked(usersApi.getMe).mockReset();
  });

  it('busca o próprio perfil', async () => {
    vi.mocked(usersApi.getMe).mockResolvedValue(buildUser());

    const { result } = renderHook(() => useMe(), { wrapper });

    await waitFor(() => expect(result.current.data?.id).toBe('user-1'));
  });
});

describe('useUpdateMe', () => {
  beforeEach(() => {
    vi.mocked(usersApi.updateMe).mockReset();
  });

  it('atualiza o próprio nome', async () => {
    vi.mocked(usersApi.updateMe).mockResolvedValue(buildUser({ name: 'Ana Silva' }));

    const { result } = renderHook(() => useUpdateMe(), { wrapper });
    result.current.mutate({ name: 'Ana Silva' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(vi.mocked(usersApi.updateMe).mock.calls[0]?.[0]).toEqual({ name: 'Ana Silva' });
  });
});

describe('useDeleteMe', () => {
  beforeEach(() => {
    vi.mocked(usersApi.deleteMe).mockReset();
  });

  it('exclui a própria conta', async () => {
    vi.mocked(usersApi.deleteMe).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteMe(), { wrapper });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(usersApi.deleteMe).toHaveBeenCalled();
  });
});
