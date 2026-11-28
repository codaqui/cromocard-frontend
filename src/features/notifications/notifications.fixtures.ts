import type { Notification, NotificationCounts, NotificationsPage } from './notifications.types';

const MINUTE_IN_MS = 60 * 1000;

export const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * MINUTE_IN_MS).toISOString();

export const aNotification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'n-1',
  title: 'Sua sugestão foi aprovada',
  message: 'O álbum Panini Brasileirão 2026 entrou no catálogo.',
  type: 'CATALOG_REQUEST',
  category: 'PLATFORM',
  referenceLink: '/albuns/brasileirao',
  isRead: false,
  createdAt: minutesAgo(15),
  ...overrides,
});

export const countsOf = (overrides: Partial<NotificationCounts> = {}): NotificationCounts => ({
  ALL: 0,
  UNREAD: 0,
  MESSAGES: 0,
  GROUPS: 0,
  PLATFORM: 0,
  ORDERS: 0,
  ...overrides,
});

export const pageOf = (
  data: Notification[],
  counts: NotificationCounts,
  nextCursor: string | null = null,
): NotificationsPage => ({ data, meta: { nextCursor, counts } });
