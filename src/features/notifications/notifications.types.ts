export const NOTIFICATION_CATEGORIES = ['MESSAGES', 'GROUPS', 'PLATFORM', 'ORDERS'] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationFilter = 'ALL' | 'UNREAD' | NotificationCategory;

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: NotificationCategory;
  referenceLink: string | null;
  isRead: boolean;
  createdAt: string;
}

export type NotificationCounts = Record<NotificationFilter, number>;

export interface NotificationsMeta {
  nextCursor: string | null;
  counts: NotificationCounts;
}

export interface NotificationsPage {
  data: Notification[];
  meta: NotificationsMeta;
}

export interface ListNotificationsParams {
  filter: NotificationFilter;
  limit?: number;
  cursor?: string;
}

export const NOTIFICATION_EVENTS = [
  'ORDER_UPDATES',
  'PAYOUT_RELEASED',
  'GROUP_INVITES',
  'DIRECT_MESSAGES',
  'CATALOG_RELEASES',
  'CATALOG_REQUESTS',
] as const;
export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

export interface ChannelChoice {
  inApp: boolean;
  email: boolean;
}

export interface NotificationPreferences {
  channels: ChannelChoice;
  events: (ChannelChoice & { event: NotificationEvent })[];
}
