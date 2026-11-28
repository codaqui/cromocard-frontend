import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { notificationsApi } from '../../notifications.api';
import { aNotification, countsOf, pageOf } from '../../notifications.fixtures';
import { NotificationBell } from './NotificationBell';

vi.mock('../../notifications.api', () => ({
  notificationsApi: { list: vi.fn(), markAsRead: vi.fn() },
}));

const list = vi.mocked(notificationsApi.list);
const counts = countsOf({ ALL: 4, UNREAD: 3, PLATFORM: 3, MESSAGES: 1 });
const unread = aNotification();
const read = aNotification({
  id: 'n-2',
  title: 'Nova expansão no catálogo',
  isRead: true,
  referenceLink: null,
});

function Where() {
  const { pathname } = useLocation();
  return <p>{`Página ${pathname}`}</p>;
}

function renderBell() {
  renderWithProviders({
    routes: [
      {
        path: '*',
        element: (
          <>
            <NotificationBell />
            <Where />
          </>
        ),
      },
    ],
    initialPath: '/inicio',
  });
}

const openBell = async () =>
  userEvent.click(await screen.findByRole('button', { name: 'Notificações, 3 não lidas' }));

describe('NotificationBell', () => {
  beforeEach(() => {
    list.mockResolvedValue(pageOf([unread, read], counts));
    vi.mocked(notificationsApi.markAsRead).mockResolvedValue({ ...unread, isRead: true });
  });

  it('CA19: mostra o número de não lidas e, ao abrir, as últimas notificações', async () => {
    renderBell();

    await openBell();

    const panel = screen.getByRole('dialog', { name: 'Notificações' });
    expect(within(panel).getByText('3 novas')).toBeInTheDocument();
    expect(within(panel).getAllByRole('listitem')).toHaveLength(2);
    expect(within(panel).getAllByRole('img', { name: 'Não lida' })).toHaveLength(1);
    expect(list).toHaveBeenCalledWith({ filter: 'ALL', limit: 4, cursor: undefined });
    expect(within(panel).getByRole('button', { name: 'Marcar todas como lidas' })).toBeDisabled();
  });

  it('sem não lidas, o sino não mostra número', async () => {
    list.mockResolvedValue(pageOf([read], countsOf({ ALL: 1, PLATFORM: 1 })));
    renderBell();

    expect(await screen.findByRole('button', { name: 'Notificações' })).not.toHaveTextContent(/\d/);
  });

  it('os filtros do popup mostram as contagens e trocam a lista', async () => {
    renderBell();
    await openBell();

    const filters = screen.getByRole('group', { name: 'Filtrar notificações' });
    expect(
      within(filters)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['Todas (4)', 'Não lidas (3)', 'Pedidos (0)', 'Grupos (0)']);
    list.mockResolvedValue(pageOf([], counts));
    await userEvent.click(within(filters).getByRole('button', { name: 'Pedidos (0)' }));

    expect(list).toHaveBeenLastCalledWith({ filter: 'ORDERS', limit: 4, cursor: undefined });
    expect(await screen.findByText('Nenhuma notificação encontrada')).toBeInTheDocument();
  });

  it('CA19: "Ver todas as notificações" leva à central e "Configurar alertas" a Configurações', async () => {
    renderBell();
    await openBell();

    expect(screen.getByRole('link', { name: 'Configurar alertas' })).toHaveAttribute(
      'href',
      '/configuracoes',
    );
    await userEvent.click(screen.getByRole('link', { name: 'Ver todas as notificações' }));

    expect(await screen.findByText('Página /notificacoes')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('a ação da notificação marca como lida, leva ao destino e fecha o popup', async () => {
    renderBell();
    await openBell();

    await userEvent.click(screen.getByRole('button', { name: 'Ver no Catálogo' }));

    expect(notificationsApi.markAsRead).toHaveBeenCalledWith('n-1');
    expect(await screen.findByText('Página /albuns/brasileirao')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('fecha com Esc e mostra o erro da busca no popup', async () => {
    renderBell();
    await openBell();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    list.mockRejectedValue(new Error('falhou'));
    await openBell();
    await userEvent.click(screen.getByRole('button', { name: 'Não lidas (3)' }));

    expect(
      await screen.findByText('Não foi possível carregar as notificações. Tente de novo.'),
    ).toBeInTheDocument();
  });
});
