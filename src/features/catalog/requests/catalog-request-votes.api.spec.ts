import { beforeEach, describe, expect, it, vi } from 'vitest';

import { catalogRequestVotesApi } from './catalog-request-votes.api';

const api = vi.hoisted(() => ({ getPage: vi.fn(), put: vi.fn() }));

vi.mock('@/lib/http', () => ({ api }));

describe('catalogRequestVotesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista as sugestões em votação com a página', async () => {
    await catalogRequestVotesApi.list({ page: 1, pageSize: 20 });

    expect(api.getPage).toHaveBeenCalledWith('/catalog-requests/voting', { page: 1, pageSize: 20 });
  });

  it('vota com PUT, porque votar de novo troca o voto', async () => {
    await catalogRequestVotesApi.vote({ id: 'sugestao-1', vote: 'NEUTRAL' });

    expect(api.put).toHaveBeenCalledWith('/catalog-requests/sugestao-1/vote', { vote: 'NEUTRAL' });
  });
});
