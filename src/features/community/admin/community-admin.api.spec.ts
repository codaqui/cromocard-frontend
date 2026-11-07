import { beforeEach, describe, expect, it, vi } from 'vitest';

import { communityAdminApi } from './community-admin.api';

const api = vi.hoisted(() => ({ get: vi.fn(), getPage: vi.fn(), post: vi.fn(), delete: vi.fn() }));

vi.mock('@/lib/http', () => ({ api }));

const action = { id: 'group-1', reason: 'Spam no grupo' };

describe('communityAdminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista os grupos e a fila de denúncias com os filtros', async () => {
    await communityAdminApi.listGroups({ q: 'copa', status: 'SUSPENDED', page: 2 });
    await communityAdminApi.listGroupMessageReports({ status: 'PENDING' });

    expect(api.getPage).toHaveBeenNthCalledWith(1, '/admin/groups', {
      q: 'copa',
      status: 'SUSPENDED',
      page: 2,
    });
    expect(api.getPage).toHaveBeenNthCalledWith(2, '/admin/reports/group-messages', {
      status: 'PENDING',
    });
  });

  it('busca os indicadores e o detalhe do grupo', async () => {
    await communityAdminApi.getSummary();
    await communityAdminApi.getGroup('group-1');

    expect(api.get).toHaveBeenNthCalledWith(1, '/admin/groups/summary');
    expect(api.get).toHaveBeenNthCalledWith(2, '/admin/groups/group-1');
  });

  it.each([
    ['suspendGroup', '/admin/groups/group-1/suspend'],
    ['reactivateGroup', '/admin/groups/group-1/reactivate'],
    ['removeReportedMessage', '/admin/reports/group-1/remove-message'],
    ['dismissReport', '/admin/reports/group-1/dismiss'],
  ] as const)('%s envia só o motivo no corpo', async (method, url) => {
    await communityAdminApi[method](action);

    expect(api.post).toHaveBeenCalledWith(url, { reason: 'Spam no grupo' });
  });

  it('exclui o grupo mandando o motivo no corpo do DELETE', async () => {
    await communityAdminApi.deleteGroup(action);

    expect(api.delete).toHaveBeenCalledWith('/admin/groups/group-1', { reason: 'Spam no grupo' });
  });
});
