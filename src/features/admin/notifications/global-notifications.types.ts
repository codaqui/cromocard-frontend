export const NOTIFICATION_AUDIENCES = ['ALL', 'ACTIVE_COLLECTORS', 'SELLERS'] as const;
export const NOTIFICATION_CHANNELS = ['IN_APP', 'EMAIL'] as const;

export type NotificationAudience = (typeof NOTIFICATION_AUDIENCES)[number];
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];
export type DispatchStatus = 'SCHEDULED' | 'SENT' | 'CANCELED';

export interface GlobalNotification {
  id: string;
  title: string;
  content: string;
  referenceLink: string | null;
  audience: NotificationAudience;
  channels: NotificationChannel[];
  status: DispatchStatus;
  recipientCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  admin: { id: string; name: string };
}

export type RecipientsCount = Record<NotificationAudience, number>;

export interface DispatchNotificationInput {
  title: string;
  content: string;
  link?: string;
  audience: NotificationAudience;
  channels: NotificationChannel[];
  scheduledAt?: string;
}

export interface ListDispatchesParams {
  page: number;
  pageSize: number;
}
