import { io, type Socket } from 'socket.io-client';

import { env } from '@/config/env';
import { accessTokenStore } from '@/lib/access-token';
import { refreshSessionOnce } from '@/lib/http';

/** `message` do `connect_error` quando o servidor recusa o token no handshake (`socket-auth.middleware.ts`). */
export const SOCKET_UNAUTHORIZED = 'UNAUTHORIZED';

let socket: Socket | null = null;

/**
 * Recusa por token vencido: renova a sessão uma vez e reconecta, porque o Socket.IO não tenta de novo sozinho
 * depois de um erro do middleware. Se o token renovado também for recusado, desiste até a próxima conexão aceita.
 */
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
    // Função, e não objeto: a cada (re)conexão o handshake leva o access token atual.
    auth: (send) => {
      send({ token: accessTokenStore.get() });
    },
  });
  renewTokenOnUnauthorized(client);
  return client;
}

/**
 * Cliente único do tempo real (ADR-012), criado na primeira chamada e ainda desconectado. As features entram nas
 * rooms e escutam os eventos dele (ex.: `useConversationSocket` na CCD046, `useGroupChat` na CCD044).
 */
export function getSocket(): Socket {
  socket ??= createSocket();
  return socket;
}

/** Conecta com o token da sessão; chamar depois do login ou ao abrir uma tela de tempo real. */
export function connectSocket(): Socket {
  const client = getSocket();
  if (!client.connected) client.connect();
  return client;
}

/** Fecha a conexão e descarta o cliente (ex.: no logout); o próximo `getSocket` cria outro. */
export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
