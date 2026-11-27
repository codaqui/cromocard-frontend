import { describe, expect, it, vi } from 'vitest';

import { listingContactApi } from './listing-contact.api';

const api = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('@/lib/http', () => ({ api }));

describe('listingContactApi', () => {
  it('abre a conversa com o vendedor pelo anúncio, sem corpo', async () => {
    api.post.mockResolvedValue({ conversationId: 'c1', created: true });

    await expect(listingContactApi.contact('anuncio-1')).resolves.toEqual({
      conversationId: 'c1',
      created: true,
    });
    expect(api.post).toHaveBeenCalledWith('/listings/anuncio-1/contact');
  });
});
