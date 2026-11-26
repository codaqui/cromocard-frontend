import { beforeEach, describe, expect, it, vi } from 'vitest';

import { contactModerationApi } from './contact-moderation.api';

const api = vi.hoisted(() => ({ post: vi.fn(), delete: vi.fn(), getPage: vi.fn() }));

vi.mock('@/lib/http', () => ({ api }));

const print = (name: string) => new File(['png'], name, { type: 'image/png' });

describe('contactModerationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bloqueia, desbloqueia e lista os bloqueados pela página', async () => {
    await contactModerationApi.block('u1');
    await contactModerationApi.unblock('u1');
    await contactModerationApi.listBlocks(2);

    expect(api.post).toHaveBeenCalledWith('/me/blocks', { userId: 'u1' });
    expect(api.delete).toHaveBeenCalledWith('/me/blocks/u1');
    expect(api.getPage).toHaveBeenCalledWith('/me/blocks', { page: 2 });
  });

  it('R16: denuncia em multipart, com cada print no campo evidences', async () => {
    const prints = [print('a.png'), print('b.png')];

    await contactModerationApi.report({
      userId: 'u1',
      reason: 'Assédio',
      description: 'Ofensas',
      block: true,
      evidences: prints,
    });

    const [url, form] = api.post.mock.calls[0] as [string, FormData];
    expect(url).toBe('/me/contact-reports');
    expect(form.get('userId')).toBe('u1');
    expect(form.get('reason')).toBe('Assédio');
    expect(form.get('description')).toBe('Ofensas');
    expect(form.get('block')).toBe('true');
    expect(form.getAll('evidences')).toEqual(prints);
  });

  it('não envia a descrição vazia', async () => {
    await contactModerationApi.report({
      userId: 'u1',
      reason: 'Spam',
      block: false,
      evidences: [print('a.png')],
    });

    const [, form] = api.post.mock.calls[0] as [string, FormData];
    expect(form.has('description')).toBe(false);
    expect(form.get('block')).toBe('false');
  });
});
