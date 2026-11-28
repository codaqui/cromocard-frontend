import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { contactModerationApi } from '../../moderation/contact-moderation.api';
import { BlockedNotice } from './BlockedNotice';

vi.mock('../../moderation/contact-moderation.api', () => ({
  contactModerationApi: { unblock: vi.fn() },
}));

function renderNotice(block: 'BY_ME' | 'BY_CONTACT') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <BlockedNotice block={block} contactId="marcos" handle="@marcos_tcg" />
    </QueryClientProvider>,
  );
}

describe('BlockedNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CA7 e R8: quem bloqueou vê o aviso e desbloqueia por ele', async () => {
    vi.mocked(contactModerationApi.unblock).mockResolvedValue(undefined);
    renderNotice('BY_ME');

    expect(
      screen.getByText(
        'Você bloqueou @marcos_tcg. Para conversar de novo, desbloqueie em Configurações › Privacidade.',
      ),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Desbloquear' }));

    expect(contactModerationApi.unblock).toHaveBeenCalledWith('marcos');
  });

  it('se o desbloqueio falhar, avisa', async () => {
    vi.mocked(contactModerationApi.unblock).mockRejectedValue(new Error('offline'));
    renderNotice('BY_ME');

    await userEvent.click(screen.getByRole('button', { name: 'Desbloquear' }));

    expect(
      await screen.findByText('Não foi possível concluir. Tente de novo.'),
    ).toBeInTheDocument();
  });

  it('CA16 e R17: quem foi bloqueado vê o aviso, sem Desbloquear', () => {
    renderNotice('BY_CONTACT');

    expect(
      screen.getByText('@marcos_tcg bloqueou você. Vocês não podem mais trocar mensagens.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Desbloquear' })).not.toBeInTheDocument();
  });
});
