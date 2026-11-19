import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { userActionMessages } from '../users.labels';
import type { UserDetail } from '../users.types';
import { useSanctionDialog } from './useSanctionDialog';

const user: UserDetail = {
  id: 'user-1',
  name: 'Diego Sancionado',
  email: 'diego@cromocard.dev',
  role: 'CUSTOMER',
  status: 'ACTIVE',
  emailVerified: true,
  createdAt: '2026-10-01T00:00:00.000Z',
  username: null,
  phone: null,
  lastLoginAt: null,
  lastLoginIp: null,
  suspendedUntil: null,
  cpf: null,
  oauthProvider: null,
  activationPending: false,
  addresses: [],
  adminActions: [],
  warningsCount: 0,
};

describe('useSanctionDialog', () => {
  it('abre com o usuário alvo e mostra a mensagem certa para cada tipo de sanção', () => {
    const { result } = renderHook(() => useSanctionDialog());

    act(() => result.current.open(user));
    expect(result.current.target).toBe(user);

    act(() => result.current.saved('warn'));
    expect(result.current.toastMessage).toBe(userActionMessages.warned);
    expect(result.current.target).toBeNull();
  });

  it('fechar sem salvar não mostra mensagem', () => {
    const { result } = renderHook(() => useSanctionDialog());

    act(() => result.current.open(user));
    act(() => result.current.close());

    expect(result.current.target).toBeNull();
    expect(result.current.toastMessage).toBeNull();
  });

  it('mostra as mensagens de suspensão e banimento, e o toast pode ser dispensado', () => {
    const { result } = renderHook(() => useSanctionDialog());

    act(() => result.current.open(user));
    act(() => result.current.saved('suspend'));
    expect(result.current.toastMessage).toBe(userActionMessages.suspended);

    act(() => result.current.open(user));
    act(() => result.current.saved('block'));
    expect(result.current.toastMessage).toBe(userActionMessages.blocked);

    act(() => result.current.dismissToast());
    expect(result.current.toastMessage).toBeNull();
  });
});
