import { vi } from 'vitest';

type Listener = (...args: never[]) => void;

export function createFakeSocket() {
  const listeners = new Map<string, Set<Listener>>();
  const socket = {
    emit: vi.fn(),
    emitWithAck: vi.fn(),
    timeout: vi.fn(() => socket),
    on: vi.fn((event: string, listener: Listener) => {
      listeners.set(event, (listeners.get(event) ?? new Set()).add(listener));
      return socket;
    }),
    off: vi.fn((event: string, listener: Listener) => {
      listeners.get(event)?.delete(listener);
      return socket;
    }),
    receive(event: string, ...args: unknown[]) {
      listeners
        .get(event)
        ?.forEach((listener) => (listener as (...values: unknown[]) => void)(...args));
    },
    listenerCount: (event: string) => listeners.get(event)?.size ?? 0,
  };
  return socket;
}

export type FakeSocket = ReturnType<typeof createFakeSocket>;
