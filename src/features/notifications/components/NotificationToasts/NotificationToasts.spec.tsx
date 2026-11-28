import { act, cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { connectSocket } from '@/lib/socket';
import { renderWithProviders } from '@/test/renderWithProviders';

import { notificationsApi } from '../../notifications.api';
import { aNotification } from '../../notifications.fixtures';
import type { Notification } from '../../notifications.types';
import { MAX_TOASTS, NotificationToasts } from './NotificationToasts';

type Listener = (notification: Notification) => void;

const listeners = new Map<string, Listener>();
const fakeSocket = {
  on: vi.fn((event: string, listener: Listener) => listeners.set(event, listener)),
  off: vi.fn((event: string) => listeners.delete(event)),
};

vi.mock('@/lib/socket', () => ({ connectSocket: vi.fn(() => fakeSocket) }));
vi.mock('../../notifications.api', () => ({
  notificationsApi: { list: vi.fn(), markAsRead: vi.fn() },
}));

const emit = (notification: Notification) =>
  act(() => {
    listeners.get('notification:new')?.(notification);
  });

function Where() {
  const { pathname } = useLocation();
  return <p>{`Página ${pathname}`}</p>;
}

function renderToasts() {
  renderWithProviders({
    routes: [
      {
        path: '*',
        element: (
          <>
            <Where />
            <NotificationToasts />
          </>
        ),
      },
    ],
    initialPath: '/inicio',
  });
}

const message = aNotification({
  id: 'n-msg',
  title: '@lucas_trader',
  message: 'Oi! A carta chegou certinho.',
  type: 'NEW_MESSAGE',
  category: 'MESSAGES',
  referenceLink: '/mensagens?conversa=c-1',
  createdAt: new Date().toISOString(),
});

describe('NotificationToasts', () => {
  beforeEach(() => {
    listeners.clear();
    vi.mocked(notificationsApi.markAsRead).mockResolvedValue({ ...message, isRead: true });
  });

  it('CA6: conecta ao socket e mostra o aviso quando chega notification:new, sem recarregar', () => {
    renderToasts();

    emit(message);

    expect(connectSocket).toHaveBeenCalled();
    const toast = screen.getByRole('article', { name: '@lucas_trader' });
    expect(toast).toHaveTextContent('Nova mensagem');
    expect(toast).toHaveTextContent('agora');
    expect(toast).toHaveTextContent('Oi! A carta chegou certinho.');
  });

  it('o botão de ação marca como lida e leva ao destino', async () => {
    renderToasts();
    emit(message);

    await userEvent.click(screen.getByRole('button', { name: 'Responder' }));

    expect(notificationsApi.markAsRead).toHaveBeenCalledWith('n-msg');
    expect(await screen.findByText('Página /mensagens')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('"Marcar como lida" fecha o aviso sem sair da página', async () => {
    renderToasts();
    emit({ ...message, referenceLink: null });

    const toast = screen.getByRole('article');
    expect(within(toast).queryByRole('button', { name: 'Responder' })).not.toBeInTheDocument();
    await userEvent.click(within(toast).getByRole('button', { name: 'Marcar como lida' }));

    expect(notificationsApi.markAsRead).toHaveBeenCalledWith('n-msg');
    expect(screen.getByText('Página /inicio')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('o × fecha o aviso sem marcar como lida', async () => {
    renderToasts();
    emit(message);

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(notificationsApi.markAsRead).not.toHaveBeenCalled();
  });

  it(`mostra no máximo ${MAX_TOASTS} avisos, o mais novo primeiro`, () => {
    renderToasts();

    for (const index of [1, 2, 3, 4]) {
      emit({ ...message, id: `n-${index}`, title: `Aviso ${index}` });
    }

    expect(screen.getAllByRole('article').map((toast) => toast.getAttribute('aria-label'))).toEqual(
      ['Aviso 4', 'Aviso 3', 'Aviso 2'],
    );
  });

  it('para de ouvir o evento ao sair da casca do site', () => {
    renderToasts();
    cleanup();

    expect(fakeSocket.off).toHaveBeenCalledWith('notification:new', expect.any(Function));
  });
});
