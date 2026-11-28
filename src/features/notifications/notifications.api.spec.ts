import { describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/http';

import { notificationsApi } from './notifications.api';
import { NOTIFICATION_EVENTS } from './notifications.types';

vi.mock('@/lib/http', () => ({
  api: { get: vi.fn(), getWithMeta: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const callsOf = (method: keyof typeof api) => vi.mocked(api)[method].mock.calls;

describe('notificationsApi', () => {
  it('list busca a página de notificações com o filtro, o limite e o cursor', () => {
    void notificationsApi.list({ filter: 'MESSAGES', limit: 50, cursor: 'n-1' });
    expect(callsOf('getWithMeta')[0]).toEqual([
      '/notifications',
      { filter: 'MESSAGES', limit: 50, cursor: 'n-1' },
    ]);
  });

  it('markAsRead marca a notificação pelo id', () => {
    void notificationsApi.markAsRead('n-1');
    expect(callsOf('patch')[0]).toEqual(['/notifications/n-1/read', {}]);
  });

  it('lê, salva e restaura as preferências de aviso', () => {
    const preferences = {
      channels: { inApp: true, email: false },
      events: NOTIFICATION_EVENTS.map((event) => ({ event, inApp: true, email: true })),
    };

    void notificationsApi.getPreferences();
    void notificationsApi.savePreferences(preferences);
    void notificationsApi.restorePreferences();

    expect(callsOf('get')[0]).toEqual(['/me/notification-preferences']);
    expect(callsOf('put')[0]).toEqual(['/me/notification-preferences', preferences]);
    expect(callsOf('delete')[0]).toEqual(['/me/notification-preferences']);
  });
});
