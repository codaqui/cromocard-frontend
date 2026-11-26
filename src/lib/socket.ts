import { io, type Socket } from 'socket.io-client';

import { env } from '@/config/env';
import { accessTokenStore } from '@/lib/access-token';
import { renewSessionOrSignOut } from '@/lib/http';

const SOCKET_UNAUTHORIZED = 'UNAUTHORIZED';
const EXPIRED_BY_SERVER = 'io server disconnect';

let socket: Socket | null = null;

function reconnectWithRenewedSession(client: Socket): void {
  void renewSessionOrSignOut().then((renewed) => {
    if (renewed && client === socket) client.connect();
  });
}

function renewTokenOnceOnUnauthorized(client: Socket): void {
  let renewedSinceLastConnect = false;
  client.on('connect', () => {
    renewedSinceLastConnect = false;
  });
  client.on('connect_error', (error) => {
    if (error.message !== SOCKET_UNAUTHORIZED || renewedSinceLastConnect) return;
    renewedSinceLastConnect = true;
    reconnectWithRenewedSession(client);
  });
}

function reconnectWhenServerExpiresToken(client: Socket): void {
  client.on('disconnect', (reason) => {
    if (reason === EXPIRED_BY_SERVER) reconnectWithRenewedSession(client);
  });
}

const sendCurrentAccessToken = (send: (data: object) => void) => {
  send({ token: accessTokenStore.get() });
};

function createSocket(): Socket {
  const client = io(env.WS_URL, { autoConnect: false, auth: sendCurrentAccessToken });
  renewTokenOnceOnUnauthorized(client);
  reconnectWhenServerExpiresToken(client);
  return client;
}

export function getSocket(): Socket {
  socket ??= createSocket();
  return socket;
}

export function connectSocket(): Socket {
  const client = getSocket();
  if (!client.connected) client.connect();
  return client;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
