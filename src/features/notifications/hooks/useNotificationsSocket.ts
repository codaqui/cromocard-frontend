import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useEffectEvent } from 'react';

import { connectSocket } from '@/lib/socket';

import { addIncomingNotification } from '../notifications.cache';
import type { Notification } from '../notifications.types';

export const NOTIFICATION_NEW_EVENT = 'notification:new';

export function useNotificationsSocket(onIncoming: (notification: Notification) => void) {
  const queryClient = useQueryClient();
  const receive = useEffectEvent((notification: Notification) => {
    addIncomingNotification(queryClient, notification);
    onIncoming(notification);
  });

  useEffect(() => {
    const socket = connectSocket();
    const listener = (notification: Notification) => receive(notification);
    socket.on(NOTIFICATION_NEW_EVENT, listener);
    return () => {
      socket.off(NOTIFICATION_NEW_EVENT, listener);
    };
  }, []);
}
