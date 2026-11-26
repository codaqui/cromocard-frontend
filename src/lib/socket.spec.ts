import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Listener = (...args: unknown[]) => void;
type AuthCallback = (send: (data: object) => void) => void;
interface SocketOptions {
  autoConnect: boolean;
  auth: AuthCallback;
}

function fakeSocket(options: SocketOptions) {
  const listeners = new Map<string, Listener[]>();
  return {
    options,
    connected: false,
    on: vi.fn((event: string, listener: Listener) => {
      listeners.set(event, [...(listeners.get(event) ?? []), listener]);
    }),
    connect: vi.fn(),
    disconnect: vi.fn(),
    fire(event: string, ...args: unknown[]) {
      (listeners.get(event) ?? []).forEach((listener) => listener(...args));
    },
  };
}

type FakeSocket = ReturnType<typeof fakeSocket>;

const { io, renewSessionOrSignOut } = vi.hoisted(() => ({
  io: vi.fn<(url: string, options: SocketOptions) => FakeSocket>(),
  renewSessionOrSignOut: vi.fn<() => Promise<boolean>>(),
}));

vi.mock('socket.io-client', () => ({ io }));
vi.mock('@/lib/http', () => ({ renewSessionOrSignOut }));

async function loadSocket() {
  vi.resetModules();
  return import('./socket');
}

function lastSocket(): FakeSocket {
  const result = io.mock.results.at(-1);
  if (result?.type !== 'return') throw new Error('o cliente não foi criado');
  return result.value;
}

function deferred() {
  let resolve: (value: boolean) => void = () => undefined;
  const promise = new Promise<boolean>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

const unauthorized = () =>
  Object.assign(new Error('UNAUTHORIZED'), { data: { error: 'UNAUTHORIZED' } });

beforeEach(() => {
  io.mockReset().mockImplementation((_url, options) => fakeSocket(options));
  renewSessionOrSignOut.mockReset().mockResolvedValue(true);
});

afterEach(async () => {
  const { accessTokenStore } = await import('@/lib/access-token');
  accessTokenStore.set(null);
});

describe('getSocket', () => {
  it('cria um cliente único para a VITE_WS_URL, sem conectar e com o transporte padrão', async () => {
    const { getSocket } = await loadSocket();

    const socket = getSocket();

    expect(getSocket()).toBe(socket);
    expect(io).toHaveBeenCalledTimes(1);
    expect(io).toHaveBeenCalledWith(
      'http://localhost:3001',
      expect.objectContaining({ autoConnect: false }),
    );
    expect(lastSocket().options).not.toHaveProperty('transports');
    expect(lastSocket().connect).not.toHaveBeenCalled();
  });

  it('manda no handshake o access token do momento da conexão', async () => {
    const { getSocket } = await loadSocket();
    const { accessTokenStore } = await import('@/lib/access-token');
    getSocket();
    const send = vi.fn();

    accessTokenStore.set('token-1');
    lastSocket().options.auth(send);
    accessTokenStore.set('token-2');
    lastSocket().options.auth(send);

    expect(send.mock.calls).toEqual([[{ token: 'token-1' }], [{ token: 'token-2' }]]);
  });
});

describe('renovação do token no connect_error', () => {
  it('renova a sessão e reconecta quando o servidor recusa o token', async () => {
    const { getSocket } = await loadSocket();
    getSocket();

    lastSocket().fire('connect_error', unauthorized());

    await vi.waitFor(() => expect(lastSocket().connect).toHaveBeenCalledTimes(1));
    expect(renewSessionOrSignOut).toHaveBeenCalledTimes(1);
  });

  it('não reconecta quando a sessão não renova', async () => {
    renewSessionOrSignOut.mockResolvedValue(false);
    const { getSocket } = await loadSocket();
    getSocket();

    lastSocket().fire('connect_error', unauthorized());

    await vi.waitFor(() => expect(renewSessionOrSignOut).toHaveBeenCalledTimes(1));
    expect(lastSocket().connect).not.toHaveBeenCalled();
  });

  it('não renova a sessão em erro de rede, que o próprio Socket.IO tenta de novo', async () => {
    const { getSocket } = await loadSocket();
    getSocket();

    lastSocket().fire('connect_error', new Error('websocket error'));

    expect(renewSessionOrSignOut).not.toHaveBeenCalled();
  });

  it('renova uma vez só até a próxima conexão aceita, para não entrar em laço', async () => {
    const { getSocket } = await loadSocket();
    getSocket();
    const socket = lastSocket();

    socket.fire('connect_error', unauthorized());
    socket.fire('connect_error', unauthorized());
    await vi.waitFor(() => expect(socket.connect).toHaveBeenCalledTimes(1));
    socket.fire('connect');
    socket.fire('connect_error', unauthorized());

    await vi.waitFor(() => expect(renewSessionOrSignOut).toHaveBeenCalledTimes(2));
  });

  it('não reconecta o cliente descartado durante a renovação', async () => {
    const renewal = deferred();
    renewSessionOrSignOut.mockReturnValue(renewal.promise);
    const { disconnectSocket, getSocket } = await loadSocket();
    getSocket();
    const socket = lastSocket();

    socket.fire('connect_error', unauthorized());
    disconnectSocket();
    renewal.resolve(true);
    await renewal.promise;

    await vi.waitFor(() => expect(renewSessionOrSignOut).toHaveBeenCalledTimes(1));
    expect(socket.connect).not.toHaveBeenCalled();
  });
});

describe('token vencido durante a conexão', () => {
  it('renova a sessão e reconecta quando o servidor derruba a conexão', async () => {
    const { getSocket } = await loadSocket();
    getSocket();

    lastSocket().fire('disconnect', 'io server disconnect');

    await vi.waitFor(() => expect(lastSocket().connect).toHaveBeenCalledTimes(1));
    expect(renewSessionOrSignOut).toHaveBeenCalledTimes(1);
  });

  it('não renova quando a conexão cai por outro motivo', async () => {
    const { getSocket } = await loadSocket();
    getSocket();

    lastSocket().fire('disconnect', 'io client disconnect');
    lastSocket().fire('disconnect', 'transport close');

    expect(renewSessionOrSignOut).not.toHaveBeenCalled();
  });
});

describe('connectSocket e disconnectSocket', () => {
  it('conecta só se ainda não estiver conectado', async () => {
    const { connectSocket } = await loadSocket();

    connectSocket();
    lastSocket().connected = true;
    connectSocket();

    expect(lastSocket().connect).toHaveBeenCalledTimes(1);
  });

  it('desconecta e descarta o cliente, e o próximo getSocket cria outro', async () => {
    const { disconnectSocket, getSocket } = await loadSocket();
    const first = getSocket();
    const firstFake = lastSocket();

    disconnectSocket();
    disconnectSocket();

    expect(firstFake.disconnect).toHaveBeenCalledTimes(1);
    expect(getSocket()).not.toBe(first);
  });
});
