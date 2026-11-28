import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { chatApi } from '../../chat.api';
import { ANA_ID, conversation, message } from '@/test/chat/chat-fixtures';
import { ConversationView } from './ConversationView';

vi.mock('../../chat.api', () => ({
  chatApi: { messages: vi.fn(), markAsRead: vi.fn().mockResolvedValue(undefined), list: vi.fn() },
}));
const sendMessage = vi.hoisted(() => vi.fn());
vi.mock('../../moderation/contact-moderation.api', () => ({
  contactModerationApi: { block: vi.fn().mockResolvedValue({}), unblock: vi.fn(), report: vi.fn() },
}));
vi.mock('../../hooks/useSendMessage', () => ({ useSendMessage: () => sendMessage }));

const today = (hour: number) => new Date(new Date().setHours(hour, 0, 0, 0)).toISOString();
const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString();

function renderView(onBack?: () => void, summary = conversation()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const element = (
    <ConversationView conversation={summary} currentUserId={ANA_ID} online onBack={onBack} />
  );
  const router = createMemoryRouter([{ path: '/', element }], { initialEntries: ['/'] });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

const page = (data: ReturnType<typeof message>[], nextCursor: string | null = null) => ({
  data,
  meta: { nextCursor },
});

describe('ConversationView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CA1: mostra o topo, a dica e as mensagens em ordem, separadas por dia', async () => {
    vi.mocked(chatApi.messages).mockResolvedValue(
      page([
        message({ id: 'm1', content: 'Oi de ontem', createdAt: yesterday }),
        message({ id: 'm2', content: 'Olá Ana!', createdAt: today(9) }),
        message({
          id: 'm3',
          content: 'Combinado',
          author: { id: ANA_ID, name: 'Ana', username: 'ana' },
          createdAt: today(10),
        }),
      ]),
    );
    renderView();

    const list = await screen.findByRole('list');
    const items = within(list)
      .getAllByRole('listitem')
      .map((item) => item.textContent);
    expect(items[0]).toMatch(/^Ontem, /);
    expect(items[2]).toMatch(/^Hoje, /);
    expect(items.filter((text) => /Oi de ontem|Olá Ana!|Combinado/.test(text ?? ''))).toHaveLength(
      3,
    );
    expect(screen.getByRole('heading', { name: 'Elisa Cartas Raras' })).toBeInTheDocument();
    expect(screen.getByText('(@elisa.raras)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver Perfil' })).toHaveAttribute(
      'href',
      '/usuarios/elisa',
    );
    expect(screen.getByLabelText('Dica de segurança')).toHaveTextContent(
      'Nunca pague por Pix ou link fora da CromoCard.',
    );
  });

  it('CA3: destaca as recebidas não lidas e marca a conversa como lida ao abrir', async () => {
    vi.mocked(chatApi.messages).mockResolvedValue(
      page([
        message({ id: 'm1', isRead: true }),
        message({ id: 'm2', content: 'Viu?', isRead: false }),
      ]),
    );
    renderView();

    expect(await screen.findByText('Viu?')).toBeInTheDocument();
    expect(screen.getAllByText('Não lida')).toHaveLength(1);
    await vi.waitFor(() =>
      expect(vi.mocked(chatApi.markAsRead).mock.calls[0]?.[0]).toBe('c-elisa'),
    );
  });

  it('R5: sem não lidas, não chama a leitura', async () => {
    vi.mocked(chatApi.messages).mockResolvedValue(page([message()]));
    renderView();

    await screen.findByText('Olá Ana!');
    expect(chatApi.markAsRead).not.toHaveBeenCalled();
  });

  it('R4: ao rolar até o topo, carrega as mensagens anteriores pelo cursor', async () => {
    vi.mocked(chatApi.messages)
      .mockResolvedValueOnce(page([message({ id: 'm9', content: 'Recente' })], 'm9'))
      .mockResolvedValueOnce(page([message({ id: 'm1', content: 'Antiga', createdAt: today(1) })]));
    renderView();

    const recent = await screen.findByText('Recente');
    fireEvent.scroll(recent.closest('ol')?.parentElement as HTMLElement, {
      target: { scrollTop: 0 },
    });

    expect(await screen.findByText('Antiga')).toBeInTheDocument();
    expect(chatApi.messages).toHaveBeenLastCalledWith('c-elisa', 'm9');
  });

  it('CA5: avisa quando não dá para carregar as mensagens', async () => {
    vi.mocked(chatApi.messages).mockRejectedValue(new Error('fora do ar'));
    renderView();

    expect(await screen.findByText('Não foi possível carregar as mensagens.')).toBeInTheDocument();
  });

  it('CA16: envia pela conversa aberta e mostra o voltar no celular', async () => {
    vi.mocked(chatApi.messages).mockResolvedValue(page([]));
    sendMessage.mockResolvedValue(message());
    const onBack = vi.fn();
    renderView(onBack);

    fireEvent.change(await screen.findByRole('textbox', { name: 'Mensagem' }), {
      target: { value: 'Oi' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Voltar para as conversas' }));

    await vi.waitFor(() => expect(sendMessage).toHaveBeenCalledWith('c-elisa', 'Oi'));
    expect(onBack).toHaveBeenCalled();
  });
});

describe('ConversationView sem @', () => {
  it('R18: usa o nome no campo quando o contato não tem @, e sem selo', async () => {
    vi.mocked(chatApi.messages).mockResolvedValue(page([]));
    const contact = {
      id: 'bruno',
      name: 'Bruno',
      username: null,
      avatarUrl: null,
      verified: false,
    };
    renderView(undefined, conversation({ contact }));

    expect(await screen.findByRole('textbox', { name: 'Mensagem' })).toHaveAttribute(
      'placeholder',
      'Digite sua mensagem para Bruno...',
    );
    expect(screen.queryByText('Verificado')).not.toBeInTheDocument();
  });
});

describe('ConversationView com bloqueio e moderação (CCD047)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(chatApi.messages).mockResolvedValue(page([message()]));
  });

  it('R8: quem bloqueou vê o aviso com Desbloquear no lugar do campo', async () => {
    renderView(undefined, conversation({ block: 'BY_ME' }));

    expect(await screen.findByText(/Você bloqueou @elisa\.raras/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Desbloquear' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Mensagem' })).not.toBeInTheDocument();
  });

  it('CA16: quem foi bloqueado vê que não pode mais trocar mensagens', async () => {
    renderView(undefined, conversation({ block: 'BY_CONTACT' }));

    expect(
      await screen.findByText('@elisa.raras bloqueou você. Vocês não podem mais trocar mensagens.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Mensagem' })).not.toBeInTheDocument();
  });

  it('R2 e R10: o escudo abre o modal, e ao bloquear ele fecha e o aviso confirma', async () => {
    renderView();
    fireEvent.click(await screen.findByRole('button', { name: 'Bloquear ou denunciar' }));
    expect(
      screen.getByRole('dialog', { name: 'Bloquear ou denunciar @elisa.raras' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /Somente bloquear/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Bloquear$/ }));

    expect(await screen.findByText('Contato bloqueado')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
