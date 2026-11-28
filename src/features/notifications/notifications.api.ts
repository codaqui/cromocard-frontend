import { api } from '@/lib/http';

import type {
  ListNotificationsParams,
  Notification,
  NotificationPreferences,
  NotificationsMeta,
} from './notifications.types';

const PREFERENCES_URL = '/me/notification-preferences';

export const notificationsApi = {
  list: (params: ListNotificationsParams) =>
    api.getWithMeta<Notification[], NotificationsMeta>('/notifications', params),
  markAsRead: (id: string) => api.patch<Notification>(`/notifications/${id}/read`, {}),
  getPreferences: () => api.get<NotificationPreferences>(PREFERENCES_URL),
  savePreferences: (preferences: NotificationPreferences) =>
    api.put<NotificationPreferences>(PREFERENCES_URL, preferences),
  restorePreferences: () => api.delete(PREFERENCES_URL),
};
