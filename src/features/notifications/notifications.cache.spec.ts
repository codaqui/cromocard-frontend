import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import {
  addIncomingNotification,
  notificationsKeys,
  type NotificationsListData,
} from './notifications.cache';
import type { Notification, NotificationFilter } from './notifications.types';

const counts = { ALL: 2, UNREAD: 1, MESSAGES: 0, GROUPS: 0, PLATFORM: 2, ORDERS: 0 };

const notification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'n-novo',
  title: '@bruno',
  message: 'Oi',
  type: 'NEW_MESSAGE',
  category: 'MESSAGES',
  referenceLink: '/mensagens',
  isRead: false,
  createdAt: '2026-11-28T15:00:00.000Z',
  ...overrides,
});

const listWith = (items: Notification[]): NotificationsListData => ({
  pages: [{ data: items, meta: { nextCursor: null, counts } }],
  pageParams: [undefined],
});

function cacheWith(filter: NotificationFilter, items: Notification[] = []) {
  const queryClient = new QueryClient();
  const key = notificationsKeys.list(filter, 50);
  queryClient.setQueryData(key, listWith(items));
  const read = () => queryClient.getQueryData<NotificationsListData>(key);
  return { queryClient, read };
}

describe('addIncomingNotification', () => {
  it('CA6: põe a nova no topo da lista "Todas" e soma 1 às não lidas e à categoria', () => {
    const { queryClient, read } = cacheWith('ALL', [
      notification({ id: 'n-antiga', isRead: true }),
    ]);

    addIncomingNotification(queryClient, notification());

    expect(read()?.pages[0]?.data.map(({ id }) => id)).toEqual(['n-novo', 'n-antiga']);
    expect(read()?.pages[0]?.meta.counts).toEqual({ ...counts, ALL: 3, UNREAD: 2, MESSAGES: 1 });
  });

  it('em outro filtro, só atualiza as contagens', () => {
    const { queryClient, read } = cacheWith('PLATFORM');

    addIncomingNotification(queryClient, notification());

    expect(read()?.pages[0]?.data).toEqual([]);
    expect(read()?.pages[0]?.meta.counts.UNREAD).toBe(2);
  });

  it('não repete a notificação que já está na lista', () => {
    const { queryClient, read } = cacheWith('ALL', [notification()]);

    addIncomingNotification(queryClient, notification());

    expect(read()?.pages[0]?.data).toHaveLength(1);
    expect(read()?.pages[0]?.meta.counts.ALL).toBe(2);
  });
});
