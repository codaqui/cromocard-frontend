import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { aNotification } from '../../notifications.fixtures';
import type { Notification } from '../../notifications.types';
import { NotificationItem } from './NotificationItem';

function renderItem(notification: Notification) {
  const onOpen = vi.fn();
  const onMarkAsRead = vi.fn();
  render(
    <MemoryRouter>
      <NotificationItem notification={notification} onOpen={onOpen} onMarkAsRead={onMarkAsRead} />
    </MemoryRouter>,
  );
  return { onOpen, onMarkAsRead };
}

describe('NotificationItem', () => {
  it('mostra o rótulo do tipo, o tempo, o título, a mensagem e o destaque de não lida', () => {
    renderItem(aNotification());

    const item = screen.getByRole('article', { name: 'Sua sugestão foi aprovada' });
    expect(item).toHaveTextContent('Solicitação ao catálogo');
    expect(item).toHaveTextContent('Há 15 min');
    expect(item).toHaveTextContent('O álbum Panini Brasileirão 2026 entrou no catálogo.');
    expect(screen.getByRole('img', { name: 'Não lida' })).toBeInTheDocument();
  });

  it('CA7: o disparo global aparece com o rótulo "Aviso da plataforma"', () => {
    renderItem(aNotification({ type: 'GLOBAL', referenceLink: null }));

    expect(screen.getByRole('article')).toHaveTextContent('Aviso da plataforma');
  });

  it('CA2: o botão de ação usa o rótulo do tipo e abre a notificação', async () => {
    const notification = aNotification();
    const { onOpen } = renderItem(notification);

    await userEvent.click(screen.getByRole('button', { name: 'Ver no Catálogo' }));

    expect(onOpen).toHaveBeenCalledWith(notification);
  });

  it('CA3: sem destino não há botão de ação, e selecionar o título abre a notificação', async () => {
    const notification = aNotification({ referenceLink: null });
    const { onOpen } = renderItem(notification);

    await userEvent.click(screen.getByRole('button', { name: notification.title }));

    expect(screen.queryByRole('button', { name: 'Ver no Catálogo' })).not.toBeInTheDocument();
    expect(onOpen).toHaveBeenCalledWith(notification);
  });

  it('CA20: o ✓ e o menu ⋮ marcam como lida', async () => {
    const notification = aNotification();
    const { onMarkAsRead } = renderItem(notification);

    await userEvent.click(screen.getByRole('button', { name: 'Marcar como lida' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Marcar como lida' }));

    expect(onMarkAsRead).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('CA20: o menu leva às preferências e não tem "Fixar no topo"', async () => {
    renderItem(aNotification());

    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }));

    expect(
      screen.getByRole('menuitem', { name: 'Configurar este tipo de alerta' }),
    ).toHaveAttribute('href', '/configuracoes');
    expect(screen.queryByText('Fixar no topo')).not.toBeInTheDocument();
  });

  it('a lida não tem destaque, o ✓ fica desativado e o menu não oferece marcar', async () => {
    renderItem(aNotification({ isRead: true }));

    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }));

    expect(screen.queryByRole('img', { name: 'Não lida' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Marcar como lida' })).toBeDisabled();
    expect(screen.queryByRole('menuitem', { name: 'Marcar como lida' })).not.toBeInTheDocument();
  });

  it('o menu fecha com Esc', async () => {
    renderItem(aNotification());

    await userEvent.click(screen.getByRole('button', { name: 'Mais ações' }));
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
