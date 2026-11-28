import { useNavigate } from 'react-router';

import { useMarkAsRead } from '../notifications.queries';
import type { Notification } from '../notifications.types';

export interface NotificationNavigationState {
  fromNotification: true;
}

export function useOpenNotification() {
  const navigate = useNavigate();
  const { mutate: markAsRead } = useMarkAsRead();

  const markIfUnread = ({ id, isRead }: Notification) => {
    if (!isRead) markAsRead(id);
  };

  const open = (notification: Notification) => {
    markIfUnread(notification);
    if (!notification.referenceLink) return;
    const state: NotificationNavigationState = { fromNotification: true };
    void navigate(notification.referenceLink, { state });
  };

  return { open, markAsRead: markIfUnread };
}
