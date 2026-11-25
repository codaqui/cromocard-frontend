import { io, type Socket } from 'socket.io-client';

import { env } from '@/config/env';
import { accessTokenStore } from '@/lib/access-token';
import { refreshSessionOnce } from '@/lib/http';

export const SOCKET_UNAUTHORIZED = 'UNAUTHORIZED';

let socket: Socket | null = null;

function renewTokenOnUnauthorized(client: Socket): void {
  let renewedSinceLastConnect = false;
  client.on('connect', () => {
    renewedSinceLastConnect = false;
  });
  client.on('connect_error', (error) => {
    if (error.message !== SOCKET_UNAUTHORIZED || renewedSinceLastConnect) return;
    renewedSinceLastConnect = true;
    void refreshSessionOnce().then((renewed) => {
      if (renewed) client.connect();
    });
  });
}

function createSocket(): Socket {
  const client = io(env.WS_URL, {
    autoConnect: false,
    transports: ['websocket'],
    auth: (send) => {
      send({ token: accessTokenStore.get() });
    },
  });
  renewTokenOnUnauthorized(client);
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
