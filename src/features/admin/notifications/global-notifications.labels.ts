import type { BadgeTone } from '@/components/Badge/Badge';

import type {
  DispatchStatus,
  NotificationAudience,
  NotificationChannel,
} from './global-notifications.types';

export const AUDIENCE_LABELS: Record<NotificationAudience, string> = {
  ALL: 'Toda a base',
  ACTIVE_COLLECTORS: 'Colecionadores ativos',
  SELLERS: 'Vendedores',
};

export const CHANNEL_OPTIONS: Record<NotificationChannel, { label: string; hint: string }> = {
  IN_APP: { label: 'Plataforma', hint: 'Central de notificações' },
  EMAIL: { label: 'E-mail', hint: 'E-mail cadastrado' },
};

export const STATUS_META: Record<DispatchStatus, { label: string; tone: BadgeTone }> = {
  SCHEDULED: { label: 'Na fila', tone: 'warning' },
  SENT: { label: 'Entregue', tone: 'info' },
  CANCELED: { label: 'Cancelado', tone: 'neutral' },
};

/** "Plataforma + E-mail", na ordem das opções do formulário. */
export const channelsLabel = (channels: NotificationChannel[]) =>
  (Object.keys(CHANNEL_OPTIONS) as NotificationChannel[])
    .filter((channel) => channels.includes(channel))
    .map((channel) => CHANNEL_OPTIONS[channel].label)
    .join(' + ');
