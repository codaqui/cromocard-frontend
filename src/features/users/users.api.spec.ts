import { describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/http';

import { usersApi } from './users.api';

vi.mock('@/lib/http', () => ({
  api: {
    get: vi.fn(),
    getPage: vi.fn(),
    post: vi.fn(),
    postEmpty: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

function callsOf(method: keyof typeof api) {
  return vi.mocked(api)[method].mock.calls;
}

describe('usersApi', () => {
  it('list busca a página de usuários com os parâmetros', () => {
    void usersApi.list({ page: 1, pageSize: 20 });
    expect(callsOf('getPage')[0]).toEqual(['/users', { page: 1, pageSize: 20 }]);
  });

  it('getMe busca o próprio usuário', () => {
    void usersApi.getMe();
    expect(callsOf('get')[0]).toEqual(['/users/me']);
  });

  it('getById busca o usuário pelo id', () => {
    void usersApi.getById('user-1');
    expect(callsOf('get')[0]).toEqual(['/users/user-1']);
  });

  it('updateMe envia o patch do próprio usuário', () => {
    void usersApi.updateMe({ name: 'Ana' });
    expect(callsOf('patch')[0]).toEqual(['/users/me', { name: 'Ana' }]);
  });

  it('deleteMe exclui o próprio usuário', () => {
    void usersApi.deleteMe();
    expect(callsOf('delete')[0]).toEqual(['/users/me']);
  });

  it('create cadastra um usuário', () => {
    const input = {
      name: 'Ana',
      email: 'ana@cromocard.dev',
      role: 'CUSTOMER' as const,
      username: undefined,
      cpf: undefined,
      phone: undefined,
      sendActivation: true,
    };
    void usersApi.create(input);
    expect(callsOf('post')[0]).toEqual(['/users', input]);
  });

  it('update edita um usuário pelo id', () => {
    const input = { name: 'Ana Silva', username: null, cpf: null, phone: null };
    void usersApi.update('user-1', input);
    expect(callsOf('patch')[0]).toEqual(['/users/user-1', input]);
  });

  it('suspend suspende um usuário com o motivo', () => {
    void usersApi.suspend('user-1', { reason: 'Violou as regras' });
    expect(callsOf('post')[0]).toEqual(['/users/user-1/suspend', { reason: 'Violou as regras' }]);
  });

  it('reactivate reativa um usuário sem motivo', () => {
    void usersApi.reactivate('user-1');
    expect(callsOf('post')[0]).toEqual(['/users/user-1/reactivate']);
  });

  it('remove exclui um usuário com o motivo', () => {
    void usersApi.remove('user-1', { reason: 'Pedido do titular' });
    expect(callsOf('delete')[0]).toEqual(['/users/user-1', { reason: 'Pedido do titular' }]);
  });

  it('resendActivation reenvia o link sem corpo', () => {
    void usersApi.resendActivation('user-1');
    expect(callsOf('postEmpty')[0]).toEqual(['/users/user-1/resend-activation']);
  });
});
