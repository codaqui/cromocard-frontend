import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { contactModerationApi } from '../../moderation/contact-moderation.api';
import { BlockedContactsDialog } from './BlockedContactsDialog';

vi.mock('../../moderation/contact-moderation.api', () => ({
  contactModerationApi: { listBlocks: vi.fn(), unblock: vi.fn() },
}));

const meta = (total: number) => ({ page: 1, pageSize: 20, total, totalPages: total ? 1 : 0 });
const caio = {
  userId: 'caio',
  name: 'Caio Mendes',
  username: 'caio_cards',
  avatarUrl: null,
  blockedAt: '2026-11-26T12:00:00.000Z',
};

function renderDialog() {
  const onClose = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <BlockedContactsDialog onClose={onClose} />
    </QueryClientProvider>,
  );
  return onClose;
}

describe('BlockedContactsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CA9: mostra "1 contato bloqueado", desbloqueia e a lista esvazia', async () => {
    vi.mocked(contactModerationApi.listBlocks)
      .mockResolvedValueOnce({ data: [caio], meta: meta(1) })
      .mockResolvedValue({ data: [], meta: meta(0) });
    vi.mocked(contactModerationApi.unblock).mockResolvedValue(undefined);
    renderDialog();

    expect(await screen.findByText('1 contato bloqueado')).toBeInTheDocument();
    expect(screen.getByText('@caio_cards')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Desbloquear Caio Mendes' }));

    expect(contactModerationApi.unblock).toHaveBeenCalledWith('caio');
    expect(await screen.findByText('Você não bloqueou ninguém.')).toBeInTheDocument();
  });

  it('conta os bloqueados no plural', async () => {
    vi.mocked(contactModerationApi.listBlocks).mockResolvedValue({
      data: [caio, { ...caio, userId: 'lia', name: 'Lia', username: null }],
      meta: meta(2),
    });
    renderDialog();

    expect(await screen.findByText('2 contatos bloqueados')).toBeInTheDocument();
  });

  it('avisa na linha quando o desbloqueio falha e mantém o contato', async () => {
    vi.mocked(contactModerationApi.listBlocks).mockResolvedValue({ data: [caio], meta: meta(1) });
    vi.mocked(contactModerationApi.unblock).mockRejectedValue(new Error('offline'));
    renderDialog();

    await userEvent.click(await screen.findByRole('button', { name: 'Desbloquear Caio Mendes' }));

    expect(
      await screen.findByText('Não foi possível concluir. Tente de novo.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Caio Mendes')).toBeInTheDocument();
  });

  it('pagina a lista quando há mais bloqueados que uma página', async () => {
    vi.mocked(contactModerationApi.listBlocks).mockImplementation((page) =>
      Promise.resolve({
        data: [{ ...caio, userId: `p${page}`, name: `Contato da página ${page}` }],
        meta: { page, pageSize: 20, total: 21, totalPages: 2 },
      }),
    );
    renderDialog();

    expect(await screen.findByText('Contato da página 1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '2' }));

    expect(await screen.findByText('Contato da página 2')).toBeInTheDocument();
    expect(contactModerationApi.listBlocks).toHaveBeenLastCalledWith(2);
  });

  it('avisa quando não consegue carregar e fecha pelo botão', async () => {
    vi.mocked(contactModerationApi.listBlocks).mockRejectedValue(new Error('offline'));
    const onClose = renderDialog();

    expect(
      await screen.findByText('Não foi possível carregar os contatos bloqueados.'),
    ).toBeInTheDocument();
    const [, footerClose] = screen.getAllByRole('button', { name: 'Fechar' });
    await userEvent.click(footerClose!);
    expect(onClose).toHaveBeenCalled();
  });
});
