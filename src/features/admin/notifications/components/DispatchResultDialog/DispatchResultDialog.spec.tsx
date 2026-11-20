import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { GlobalNotification, NotificationChannel } from '../../global-notifications.types';
import { DispatchResultDialog } from './DispatchResultDialog';

const sent: GlobalNotification = {
  id: 'd-1',
  title: 'Manutenção programada no sábado',
  content: 'Fora do ar das 2h às 4h.',
  referenceLink: null,
  audience: 'ALL',
  channels: ['IN_APP'],
  status: 'SENT',
  recipientCount: 48610,
  scheduledAt: null,
  sentAt: '2026-11-10T14:15:00Z',
  createdAt: '2026-11-10T14:15:00Z',
  admin: { id: 'a-1', name: 'Master Admin' },
};

function renderDialog(dispatch: GlobalNotification) {
  render(<DispatchResultDialog dispatch={dispatch} onSeeHistory={vi.fn()} onClose={vi.fn()} />);
  return screen.getByRole('dialog');
}

interface SentCase {
  name: string;
  channels: NotificationChannel[];
  message: string;
}

const SENT_CASES: SentCase[] = [
  {
    name: 'só plataforma',
    channels: ['IN_APP'],
    message: 'A notificação já está na central de notificações dos usuários do público escolhido.',
  },
  {
    name: 'só e-mail',
    channels: ['EMAIL'],
    message: 'O e-mail com a notificação está sendo enviado aos usuários do público escolhido.',
  },
  {
    name: 'plataforma e e-mail',
    channels: ['IN_APP', 'EMAIL'],
    message:
      'A notificação já está na central de notificações, e o e-mail está sendo enviado aos usuários do público escolhido.',
  },
];

describe('DispatchResultDialog', () => {
  it.each(SENT_CASES)(
    'CCD101 CA2: enviada por $name diz onde a notificação chegou',
    ({ channels, message }) => {
      const dialog = renderDialog({ ...sent, channels });

      expect(dialog).toHaveTextContent(message);
    },
  );

  it('CCD101 CA2: enviada só por e-mail não fala da central de notificações', () => {
    const dialog = renderDialog({ ...sent, channels: ['EMAIL'] });

    expect(dialog).not.toHaveTextContent('central de notificações');
  });

  it('CCD100: agendada mostra o envio programado', () => {
    const dialog = renderDialog({
      ...sent,
      status: 'SCHEDULED',
      recipientCount: 0,
      scheduledAt: '2099-11-13T23:30:00Z',
      sentAt: null,
    });

    expect(dialog).toHaveTextContent('Notificação agendada');
    expect(dialog).toHaveTextContent('ENVIO PROGRAMADO');
    expect(dialog).not.toHaveTextContent('DESTINATÁRIOS');
  });
});
