import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { chatApi } from '../../chat.api';
import type { Contact, ContactResult } from '../../chat.types';
import { conversation } from '../../test/chat-fixtures';
import { NewConversationModal } from './NewConversationModal';

vi.mock('../../chat.api', () => ({
  chatApi: { contacts: vi.fn(), start: vi.fn(), list: vi.fn() },
}));

const renata: ContactResult = {
  id: 'renata',
  name: 'Renata Valente',
  username: 'valente_cards',
  avatarUrl: null,
  verified: true,
  role: 'CUSTOMER',
  commonGroups: ['Pokémon TCG São Paulo', 'Syndicate SP'],
};
const renan: ContactResult = {
  ...renata,
  id: 'renan',
  name: 'Renan Souza',
  username: 'renan_slabs',
  commonGroups: ['Syndicate SP'],
};
const rei: ContactResult = {
  ...renata,
  id: 'rei',
  name: 'Rei das Cartas BR',
  username: null,
  role: 'SELLER',
  commonGroups: [],
};
const thiago: Contact = {
  id: 'thiago',
  name: 'Thiago Alves',
  username: 'thiago_alves',
  avatarUrl: null,
  verified: false,
};

function renderModal() {
  const props = { recent: [thiago, renata], onStarted: vi.fn(), onClose: vi.fn() };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <NewConversationModal {...props} />
    </QueryClientProvider>,
  );
  return props;
}

const section = (name: string) => screen.getByRole('region', { name });

describe('NewConversationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(chatApi.contacts).mockResolvedValue([renata, renan, rei]);
  });

  it('CA11: título, subtítulo, os resultados com os grupos em comum e as conversas recentes', async () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: 'Nova conversa' })).toBeInTheDocument();
    expect(
      screen.getByText('Envie uma mensagem privada para outro colecionador.'),
    ).toBeInTheDocument();
    expect(
      await within(section('Resultados')).findByText('Renata Valente (@valente_cards)'),
    ).toBeInTheDocument();
    expect(within(section('Resultados')).getAllByText('2 grupos em comum')).toHaveLength(2);
    expect(within(section('Resultados')).getAllByText('Syndicate SP')).toHaveLength(2);
    expect(within(section('Resultados')).getByText('Vendedor')).toBeInTheDocument();
    expect(within(section('Resultados')).getByText('Lojista')).toBeInTheDocument();
    expect(within(section('Conversas recentes')).getAllByRole('listitem')).toHaveLength(1);
    expect(
      within(section('Conversas recentes')).getByText('Thiago Alves (@thiago_alves)'),
    ).toBeInTheDocument();
  });

  it('CA13 e CA14: busca pelo texto e pela aba escolhida', async () => {
    renderModal();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar colecionador' }), 'ren');
    await userEvent.click(screen.getByRole('button', { name: 'Dos meus grupos' }));

    expect(chatApi.contacts).toHaveBeenLastCalledWith({ q: 'ren', scope: 'groups' });
    expect(screen.getByRole('button', { name: 'Dos meus grupos' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('CA13: Conversar abre a conversa e avisa o id', async () => {
    vi.mocked(chatApi.start).mockResolvedValue(conversation({ id: 'c-renan' }));
    const props = renderModal();

    const row = (await screen.findByText('Renan Souza (@renan_slabs)')).closest(
      'li',
    ) as HTMLElement;
    await userEvent.click(within(row).getByRole('button', { name: 'Conversar' }));

    await vi.waitFor(() => expect(props.onStarted).toHaveBeenCalledWith('c-renan'));
    expect(vi.mocked(chatApi.start).mock.calls[0]?.[0]).toBe('renan');
  });

  it('R13: avisa se não der para abrir a conversa', async () => {
    vi.mocked(chatApi.start).mockRejectedValue(new Error('404'));
    renderModal();

    const row = (await screen.findByText('Rei das Cartas BR')).closest('li') as HTMLElement;
    await userEvent.click(within(row).getByRole('button', { name: 'Conversar' }));

    expect(
      await screen.findByText('Não foi possível abrir a conversa. Tente de novo.'),
    ).toBeInTheDocument();
  });

  it('CA14: sem resultado, avisa; e Cancelar fecha', async () => {
    vi.mocked(chatApi.contacts).mockResolvedValue([]);
    const props = renderModal();

    expect(await screen.findByText('Nenhum colecionador encontrado.')).toBeInTheDocument();
    expect(within(section('Conversas recentes')).getAllByRole('listitem')).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(props.onClose).toHaveBeenCalled();
  });
});
