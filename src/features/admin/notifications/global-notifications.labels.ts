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

const CHANNEL_PLACES: Record<NotificationChannel, string> = {
  IN_APP: 'a central de notificações',
  EMAIL: 'o e-mail',
};

const orderedChannels = (channels: NotificationChannel[]) =>
  (Object.keys(CHANNEL_OPTIONS) as NotificationChannel[]).filter((channel) =>
    channels.includes(channel),
  );

export const channelPlaces = (channels: NotificationChannel[]) =>
  orderedChannels(channels)
    .map((channel) => CHANNEL_PLACES[channel])
    .join(' e ') || CHANNEL_PLACES.IN_APP;

export const channelsLabel = (channels: NotificationChannel[]) =>
  orderedChannels(channels)
    .map((channel) => CHANNEL_OPTIONS[channel].label)
    .join(' + ');
