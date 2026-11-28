import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createFakeSocket, type FakeSocket } from '@/test/chat/fake-socket';
import { usePresence, withPresence } from './usePresence';

let socket: FakeSocket;
vi.mock('@/lib/socket', () => ({ connectSocket: () => socket }));

type Ack = (response: unknown) => void;
const answer = (response: unknown) => {
  const ack = socket.emit.mock.calls.at(-1)?.[2] as Ack;
  act(() => ack(response));
};

describe('usePresence (R15)', () => {
  beforeEach(() => {
    socket = createFakeSocket();
  });

  it('CA15: pergunta quem está online e muda o ponto com presence:changed', () => {
    const { result } = renderHook(() => usePresence(['elisa', 'thiago']));

    expect(socket.emit).toHaveBeenCalledWith(
      'presence:list',
      { userIds: ['elisa', 'thiago'] },
      expect.any(Function),
    );
    answer({ data: { online: ['elisa'] } });
    expect([...result.current]).toEqual(['elisa']);

    act(() => socket.receive('presence:changed', { userId: 'thiago', online: true }));
    act(() => socket.receive('presence:changed', { userId: 'elisa', online: false }));
    expect([...result.current]).toEqual(['thiago']);
  });

  it('ignora a resposta de erro e pergunta de novo ao reconectar', () => {
    const { result } = renderHook(() => usePresence(['elisa']));

    answer({ error: 'VALIDATION_ERROR' });
    socket.receive('connect');

    expect(result.current.size).toBe(0);
    expect(socket.emit).toHaveBeenCalledTimes(2);
  });

  it('sem contatos, não pergunta e solta os eventos ao desmontar', () => {
    const { unmount } = renderHook(() => usePresence([]));

    unmount();

    expect(socket.emit).not.toHaveBeenCalled();
    expect(socket.listenerCount('presence:changed')).toBe(0);
  });

  it('withPresence não altera o conjunto anterior', () => {
    const before = new Set(['elisa']);

    expect([...withPresence(before, { userId: 'bruno', online: true })]).toEqual([
      'elisa',
      'bruno',
    ]);
    expect([...before]).toEqual(['elisa']);
  });
});
