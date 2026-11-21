import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';
import type { PaginationMeta } from '@/types/api';

import { catalogRequestVotesApi } from '../../catalog-request-votes.api';
import type { VotingSuggestion } from '../../catalog-request-votes.types';
import { CommunitySuggestionsPage } from './CommunitySuggestionsPage';

vi.mock('../../catalog-request-votes.api', () => ({
  catalogRequestVotesApi: { list: vi.fn(), vote: vi.fn() },
}));

const lorcana: VotingSuggestion = {
  id: '0199a000-0000-7000-8000-000000000028',
  code: '#SOL-0028',
  name: 'Disney Lorcana TCG (Ravensburger)',
  description: 'Card game da Disney publicado pela Ravensburger, com coleções desde 2023.',
  requester: { id: 'user-1', name: 'Lucas', username: 'lucas_slab_collector' },
  votes: { for: 331, neutral: 6, against: 3, total: 340 },
  myVote: 'FOR',
  createdAt: '2026-11-10T12:00:00Z',
};

const gundam: VotingSuggestion = {
  ...lorcana,
  id: '0199a000-0000-7000-8000-000000000031',
  code: '#SOL-0031',
  name: 'Gundam Card Game (Bandai)',
  description: null,
  requester: { id: 'user-2', name: 'Strawhat Seller', username: null },
  votes: { for: 30, neutral: 10, against: 8, total: 48 },
  myVote: null,
};

const metaOf = (total: number): PaginationMeta => ({
  page: 1,
  pageSize: 10,
  total,
  totalPages: Math.ceil(total / 10),
});
const pageOf = (data: VotingSuggestion[]) => ({ data, meta: metaOf(data.length) });

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <CommunitySuggestionsPage />
    </QueryClientProvider>,
  );
}

const cardOf = (name: RegExp) => screen.findByRole('article', { name });
const voteButton = (card: HTMLElement, name: string) => within(card).getByRole('button', { name });

describe('CommunitySuggestionsPage', () => {
  beforeEach(() => {
    vi.mocked(catalogRequestVotesApi.list)
      .mockReset()
      .mockResolvedValue(pageOf([lorcana, gundam]));
    vi.mocked(catalogRequestVotesApi.vote).mockReset();
  });

  it('mostra o carregando enquanto busca as sugestões', () => {
    vi.mocked(catalogRequestVotesApi.list).mockReturnValue(new Promise(() => undefined));

    renderPage();

    expect(screen.getByRole('heading', { name: 'Sugestões da comunidade' })).toBeInTheDocument();
    expect(screen.getByText('Carregando as sugestões…')).toBeInTheDocument();
  });

  it('R2: lista as sugestões com protocolo, autor, descrição, contagem e o voto do cliente', async () => {
    renderPage();

    const card = await cardOf(/Disney Lorcana/);
    expect(card).toHaveTextContent('Protocolo #SOL-0028');
    expect(card).toHaveTextContent('sugerida por @lucas_slab_collector');
    expect(card).toHaveTextContent('Card game da Disney');
    expect(card).toHaveTextContent('340 votos');
    for (const value of ['331 (97,4%)', '6 (1,8%)', '3 (0,9%)']) {
      expect(card).toHaveTextContent(value);
    }
    expect(card).toHaveTextContent('Você votou a favor.');
    expect(voteButton(card, 'A favor')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('2 em votação')).toBeInTheDocument();
    expect(screen.getByText('1 voto seu')).toBeInTheDocument();
    expect(screen.getByText('2 sugestões de categoria')).toBeInTheDocument();
  });

  it('quem ainda não votou vê o convite e nenhum botão marcado; sem @, mostra o nome', async () => {
    renderPage();

    const card = await cardOf(/Gundam/);
    expect(card).toHaveTextContent('Você ainda não votou nesta sugestão.');
    expect(card).toHaveTextContent('sugerida por Strawhat Seller');
    expect(within(card).queryByRole('button', { pressed: true })).not.toBeInTheDocument();
  });

  it('CA1: votar a favor envia o voto e a lista volta com a contagem atualizada', async () => {
    const user = userEvent.setup();
    const voted = {
      ...gundam,
      myVote: 'FOR' as const,
      votes: { ...gundam.votes, for: 31, total: 49 },
    };
    vi.mocked(catalogRequestVotesApi.vote).mockResolvedValue(voted);
    renderPage();
    const card = await cardOf(/Gundam/);
    vi.mocked(catalogRequestVotesApi.list).mockResolvedValue(pageOf([lorcana, voted]));

    await user.click(voteButton(card, 'A favor'));

    expect(vi.mocked(catalogRequestVotesApi.vote).mock.calls[0]?.[0]).toEqual({
      id: gundam.id,
      vote: 'FOR',
    });
    expect(await within(card).findByText(/Você votou a favor/)).toBeInTheDocument();
    expect(card).toHaveTextContent('49 votos');
    expect(voteButton(card, 'A favor')).toHaveAttribute('aria-pressed', 'true');
  });

  it('CA2: trocar o voto de a favor para contra envia o novo voto', async () => {
    const user = userEvent.setup();
    const changed = { ...lorcana, myVote: 'AGAINST' as const };
    vi.mocked(catalogRequestVotesApi.vote).mockResolvedValue(changed);
    renderPage();
    const card = await cardOf(/Disney Lorcana/);
    vi.mocked(catalogRequestVotesApi.list).mockResolvedValue(pageOf([changed, gundam]));

    await user.click(voteButton(card, 'Contra'));

    expect(vi.mocked(catalogRequestVotesApi.vote).mock.calls[0]?.[0]).toEqual({
      id: lorcana.id,
      vote: 'AGAINST',
    });
    expect(await within(card).findByText(/Você votou contra/)).toBeInTheDocument();
    expect(card).toHaveTextContent('340 votos');
  });

  it('CA3 e CA10: votação encerrada mostra o aviso e a sugestão sai da lista', async () => {
    const user = userEvent.setup();
    vi.mocked(catalogRequestVotesApi.vote).mockRejectedValue(
      new ApiError({ status: 409, code: 'VOTING_CLOSED', message: 'A votação foi encerrada' }),
    );
    renderPage();
    const card = await cardOf(/Gundam/);
    vi.mocked(catalogRequestVotesApi.list).mockResolvedValue(pageOf([lorcana]));

    await user.click(voteButton(card, 'Neutro'));

    expect(await screen.findByText('Votação encerrada')).toBeInTheDocument();
    expect(
      screen.getByText(
        'A sugestão #SOL-0031 já foi analisada pela equipe e não aceita mais votos.',
      ),
    ).toBeInTheDocument();
    expect(await screen.findByText('1 em votação')).toBeInTheDocument();
    expect(screen.queryByRole('article', { name: /Gundam/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fechar aviso' }));
    expect(screen.queryByText('Votação encerrada')).not.toBeInTheDocument();
  });

  it('outra falha ao votar mostra a mensagem do erro', async () => {
    const user = userEvent.setup();
    vi.mocked(catalogRequestVotesApi.vote).mockRejectedValue(
      new Error('Sem conexão com o servidor'),
    );
    renderPage();
    const card = await cardOf(/Gundam/);

    await user.click(voteButton(card, 'Contra'));

    expect(await screen.findByText('Sem conexão com o servidor')).toBeInTheDocument();
  });

  it('enquanto um voto é enviado, todos os botões ficam bloqueados e um segundo clique é ignorado', async () => {
    const user = userEvent.setup();
    vi.mocked(catalogRequestVotesApi.vote).mockReturnValue(new Promise(() => undefined));
    renderPage();
    const gundamCard = await cardOf(/Gundam/);
    const lorcanaCard = await cardOf(/Disney Lorcana/);

    await user.click(voteButton(gundamCard, 'A favor'));
    await user.click(voteButton(lorcanaCard, 'Contra'));

    expect(voteButton(gundamCard, 'Contra')).toHaveAttribute('aria-disabled', 'true');
    expect(voteButton(lorcanaCard, 'Contra')).toHaveAttribute('aria-disabled', 'true');
    expect(within(gundamCard).getByRole('group')).toHaveAttribute('aria-busy', 'true');
    expect(catalogRequestVotesApi.vote).toHaveBeenCalledTimes(1);
  });

  it('o botão clicado mantém o foco enquanto o voto é enviado', async () => {
    const user = userEvent.setup();
    vi.mocked(catalogRequestVotesApi.vote).mockReturnValue(new Promise(() => undefined));
    renderPage();
    const button = voteButton(await cardOf(/Gundam/), 'A favor');

    await user.click(button);

    expect(button).toHaveFocus();
  });

  it('a página que ficou vazia depois de um voto encerrado volta para a última página', async () => {
    const user = userEvent.setup();
    vi.mocked(catalogRequestVotesApi.list).mockImplementation(({ page = 1 }) =>
      Promise.resolve(
        page === 1
          ? { data: [lorcana], meta: { page: 1, pageSize: 10, total: 11, totalPages: 2 } }
          : { data: [], meta: { page, pageSize: 10, total: 10, totalPages: 1 } },
      ),
    );
    renderPage();
    await cardOf(/Disney Lorcana/);

    await user.click(screen.getByRole('button', { name: 'Próximo' }));

    expect(await cardOf(/Disney Lorcana/)).toBeInTheDocument();
    expect(screen.queryByText('Nenhuma sugestão em votação')).not.toBeInTheDocument();
  });

  it('o chip "votos seus" só aparece quando a lista cabe numa página', async () => {
    vi.mocked(catalogRequestVotesApi.list).mockResolvedValue({
      data: [lorcana, gundam],
      meta: { page: 1, pageSize: 10, total: 25, totalPages: 3 },
    });

    renderPage();
    await cardOf(/Disney Lorcana/);

    expect(screen.getByText('25 em votação')).toBeInTheDocument();
    expect(screen.queryByText(/voto seu|votos seus/)).not.toBeInTheDocument();
  });

  it('CA9: sem sugestões pendentes mostra "Nenhuma sugestão em votação"', async () => {
    vi.mocked(catalogRequestVotesApi.list).mockResolvedValue(pageOf([]));

    renderPage();

    expect(await screen.findByText('Nenhuma sugestão em votação')).toBeInTheDocument();
    expect(screen.getByText('0 em votação')).toBeInTheDocument();
    expect(screen.queryByText(/voto seu/)).not.toBeInTheDocument();
  });

  it('erro ao carregar mostra a mensagem e tenta de novo', async () => {
    const user = userEvent.setup();
    vi.mocked(catalogRequestVotesApi.list).mockRejectedValueOnce(new Error('Falha ao carregar'));
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Tentar de novo' }));

    expect(await cardOf(/Disney Lorcana/)).toBeInTheDocument();
  });
});
