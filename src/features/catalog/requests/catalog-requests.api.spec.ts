import { beforeEach, describe, expect, it, vi } from 'vitest';

import { catalogRequestsApi } from './catalog-requests.api';

const api = vi.hoisted(() => ({ getPage: vi.fn(), post: vi.fn(), getBlob: vi.fn() }));

vi.mock('@/lib/http', () => ({ api }));

describe('catalogRequestsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista as solicitações com o tipo e a página', async () => {
    await catalogRequestsApi.list({ type: 'CARD', page: 2, pageSize: 10 });

    expect(api.getPage).toHaveBeenCalledWith('/admin/catalog-requests', {
      type: 'CARD',
      page: 2,
      pageSize: 10,
    });
  });

  it('aprova e recusa com o motivo', async () => {
    await catalogRequestsApi.approve('request-1');
    await catalogRequestsApi.reject({ id: 'request-1', reason: 'Sem fonte oficial' });

    expect(api.post).toHaveBeenNthCalledWith(1, '/admin/catalog-requests/request-1/approve');
    expect(api.post).toHaveBeenNthCalledWith(2, '/admin/catalog-requests/request-1/reject', {
      reason: 'Sem fonte oficial',
    });
  });

  it('baixa o checklist do álbum sugerido em CSV', async () => {
    await catalogRequestsApi.downloadChecklist('request-1');

    expect(api.getBlob).toHaveBeenCalledWith('/admin/catalog-requests/request-1/checklist.csv');
  });
});
