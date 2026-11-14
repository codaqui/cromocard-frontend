import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { userActionMessages } from '../users.labels';
import type { UserSummary } from '../users.types';
import { useUserActionDialogs } from './useUserActionDialogs';
import { useUserFormModal } from './useUserFormModal';

const user: UserSummary = {
  id: 'user-1',
  name: 'Diego Suspenso',
  email: 'diego@cromocard.dev',
  role: 'CUSTOMER',
  status: 'SUSPENDED',
  emailVerified: true,
  createdAt: '2026-10-01T00:00:00.000Z',
};

describe('useUserActionDialogs', () => {
  it('reativar um suspenso mostra a mensagem de reativado e fecha o diálogo', () => {
    const { result } = renderHook(() => useUserActionDialogs());

    act(() => result.current.openSuspend(user));
    expect(result.current.suspendTarget).toBe(user);
    act(() => result.current.savedSuspend());

    expect(result.current.toastMessage).toBe(userActionMessages.reactivated);
    expect(result.current.suspendTarget).toBeNull();
    act(() => result.current.dismissToast());
    expect(result.current.toastMessage).toBeNull();
  });

  it('cancelar fecha sem mensagem, e salvar sem alvo não mostra nada', () => {
    const { result } = renderHook(() => useUserActionDialogs());

    act(() => result.current.openDelete(user));
    act(() => result.current.close());
    expect(result.current.deleteTarget).toBeNull();

    act(() => result.current.savedSuspend());
    expect(result.current.toastMessage).toBeNull();
  });
});

describe('useUserFormModal', () => {
  it('cancelar fecha o modal e o toast pode ser dispensado', () => {
    const { result } = renderHook(() => useUserFormModal());

    act(() => result.current.openEdit(user));
    expect(result.current.editingUser).toBe(user);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.openCreate());
    act(() => result.current.saved());
    expect(result.current.toastMessage).toBe(userActionMessages.created);
    act(() => result.current.dismissToast());
    expect(result.current.toastMessage).toBeNull();
  });
});
