import { beforeEach, describe, expect, it, vi } from 'vitest';

import { globalNotificationsApi } from './global-notifications.api';

const http = vi.hoisted(() => ({
  getPage: vi.fn().mockResolvedValue(undefined),
  get: vi.fn().mockResolvedValue(undefined),
  post: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/http', () => ({ api: http }));

describe('globalNotificationsApi', () => {
  beforeEach(() => Object.values(http).forEach((fn) => fn.mockClear()));

  it('lista o histórico e conta os destinatários de cada público', async () => {
    await globalNotificationsApi.list({ page: 2, pageSize: 10 });
    await globalNotificationsApi.recipientsCount();

    expect(http.getPage).toHaveBeenCalledWith('/global-notifications', { page: 2, pageSize: 10 });
    expect(http.get).toHaveBeenCalledWith('/global-notifications/recipients-count');
  });

  it('dispara e cancela um agendamento', async () => {
    const input = {
      title: 'Oi',
      content: 'Texto',
      audience: 'ALL' as const,
      channels: ['IN_APP' as const],
    };

    await globalNotificationsApi.dispatch(input);
    await globalNotificationsApi.cancel('d-1');

    expect(http.post).toHaveBeenCalledWith('/global-notifications', input);
    expect(http.post).toHaveBeenCalledWith('/global-notifications/d-1/cancel');
  });
});
