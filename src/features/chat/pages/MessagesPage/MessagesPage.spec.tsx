import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { chatApi } from '../../chat.api';
import type { ConversationSummary } from '../../chat.types';
import { ANA_ID, bruno, conversation, message } from '@/test/chat/chat-fixtures';
import { createFakeSocket, type FakeSocket } from '@/test/chat/fake-socket';
import { MessagesPage } from './MessagesPage';

let socket: FakeSocket;
vi.mock('@/lib/socket', () => ({ connectSocket: () => socket }));
vi.mock('../../chat.api', () => ({
  chatApi: {
    list: vi.fn(),
    messages: vi.fn(),
    markAsRead: vi.fn().mockResolvedValue(undefined),
    contacts: vi.fn().mockResolvedValue([]),
    start: vi.fn(),
  },
}));

const listed = (items: ConversationSummary[], unread = 1) => ({
  data: items,
  meta: {
    page: 1,
    pageSize: 50,
    total: items.length,
    totalPages: 1,
    totals: { all: items.length, unread },
  },
});

function renderPage(initialPath = '/mensagens') {
  return renderWithProviders({
    routes: [{ path: '/mensagens', element: <MessagesPage /> }],
    initialPath,
    user: { id: ANA_ID, role: 'CUSTOMER' },
  });
}

describe('MessagesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socket = createFakeSocket();
    vi.mocked(chatApi.list).mockResolvedValue(listed([conversation(), bruno]));
    vi.mocked(chatApi.messages).mockResolvedValue({
      data: [message()],
      meta: { nextCursor: null },
    });
  });

  it('CA1: mostra o título, a lista e pede para escolher uma conversa', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Chat pessoal com outros colecionadores' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('2 de 2 conversas listadas')).toBeInTheDocument();
    expect(screen.getByText('Selecione uma conversa para ver as mensagens.')).toBeInTheDocument();
    expect(socket.emit).toHaveBeenCalledWith(
      'presence:list',
      { userIds: ['elisa', 'bruno'] },
      expect.any(Function),
    );
  });

  it('CA1: selecionar uma conversa abre as mensagens e guarda a escolha na URL', async () => {
    const router = renderPage();

    await userEvent.click(await screen.findByText('Bruno Figurinhas'));

    expect(
      await screen.findByRole('region', { name: 'Conversa com Bruno Figurinhas' }),
    ).toBeInTheDocument();
    expect(router.state.location.search).toBe('?conversa=c-bruno');
  });

  it('abre direto a conversa da URL e volta para a lista', async () => {
    const router = renderPage('/mensagens?conversa=c-elisa');

    expect(await screen.findByText('Olá Ana!')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Voltar para as conversas' }));

    expect(router.state.location.search).toBe('');
  });

  it('CCD073 CA1: vindo do anúncio, abre a conversa com o texto sugerido uma vez só', async () => {
    const text = 'Olá! Tenho interesse no anúncio Lionel Messi (R$ 1.750).';
    const router = renderWithProviders({
      routes: [
        { path: '/anuncios/:id', element: <p>Anúncio</p> },
        { path: '/mensagens', element: <MessagesPage /> },
      ],
      initialPath: '/anuncios/anuncio-messi',
      user: { id: ANA_ID, role: 'CUSTOMER' },
    });

    await router.navigate('/mensagens?conversa=c-elisa', {
      state: { draft: { conversationId: 'c-elisa', text } },
    });

    expect(await screen.findByRole('textbox', { name: 'Mensagem' })).toHaveValue(text);
    await vi.waitFor(() => expect(router.state.location.state).toBeNull());
    await userEvent.click(screen.getByText('Bruno Figurinhas'));
    await userEvent.click(await screen.findByText('Elisa Cartas Raras'));
    expect(await screen.findByRole('textbox', { name: 'Mensagem' })).toHaveValue('');
  });

  it('CA12: busca e troca de aba pedem a lista de novo', async () => {
    renderPage();

    await userEvent.type(await screen.findByRole('searchbox', { name: 'Buscar conversa' }), 'ren');
    await userEvent.click(screen.getByRole('button', { name: /Não Lidas/ }));

    expect(chatApi.list).toHaveBeenLastCalledWith({ q: 'ren', filter: 'unread' });
  });

  it('CA4: sem conversas, mostra "Nenhuma conversa ainda" e a dica', async () => {
    vi.mocked(chatApi.list).mockResolvedValue(listed([], 0));
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma conversa ainda' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Toque em "Nova conversa"/)).toBeInTheDocument();
    expect(screen.getByText('Nenhuma conversa')).toBeInTheDocument();
  });

  it('CA5: avisa quando não dá para carregar as conversas', async () => {
    vi.mocked(chatApi.list).mockRejectedValue(new Error('fora do ar'));
    renderPage();

    expect(await screen.findByText('Não foi possível carregar as mensagens.')).toBeInTheDocument();
  });

  it('CA13: Nova conversa abre o modal com as recentes e, ao conversar, abre a conversa', async () => {
    vi.mocked(chatApi.start).mockResolvedValue(bruno);
    const router = renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Nova conversa' }));
    const recent = await screen.findByRole('region', { name: 'Conversas recentes' });
    const row = within(recent).getByText('Bruno Figurinhas').closest('li') as HTMLElement;
    await userEvent.click(within(row).getByRole('button', { name: 'Conversar' }));

    await vi.waitFor(() => expect(router.state.location.search).toBe('?conversa=c-bruno'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Cancelar fecha o modal sem abrir conversa', async () => {
    const router = renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Nova conversa' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(router.state.location.search).toBe('');
  });
});
