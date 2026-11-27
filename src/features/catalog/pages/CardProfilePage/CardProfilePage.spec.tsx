import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ListingSummary } from '@/features/marketplace';
import { ApiError } from '@/lib/api-error';
import { api } from '@/lib/http';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { AuthenticatedUser } from '@/types/authenticated-user';

import type { CardProfile } from '../../card-profile.types';
import { CardProfilePage } from './CardProfilePage';

const CARD_ID = '0199a000-0000-7000-8000-000000000010';
const GUEST_NOTICE = /Ainda não tem conta\? Você pode ver tudo nesta página/;

const messi: CardProfile = {
  id: CARD_ID,
  name: 'Lionel Messi',
  images: { front: 'https://cdn/frente.png', back: 'https://cdn/verso.png', photos: [] },
  breadcrumb: { category: { id: 'futebol', name: 'Futebol' } },
  identification: {
    number: '10',
    album: { id: 'album', title: 'Copa do Mundo 2026' },
    category: { id: 'selecoes', name: 'Seleções' },
    rarity: { id: 'lendaria', name: 'Lendária' },
    language: { id: 'pt', name: 'Português - Brasil' },
  },
  market: { averagePrice: '2100.00', lowestListingPrice: '1750.00', activeListingsCount: 4 },
};

vi.mock('@/lib/http', () => ({ api: { get: vi.fn(), getPage: vi.fn() } }));

const listingOf = (id: string, price: string, username: string): ListingSummary => ({
  id,
  price,
  condition: { name: 'Bom' },
  seller: { id: `seller-${id}`, username },
});

const listings = [
  listingOf('l1', '1750.00', 'tiago_trocas'),
  listingOf('l2', '1820.00', 'ana_cards'),
  listingOf('l3', '1980.00', 'copa_trocas'),
  listingOf('l4', '2390.00', 'rodrigo_slabs'),
];

const customer: AuthenticatedUser = { id: 'u1', role: 'CUSTOMER' };
const seller: AuthenticatedUser = { id: 'u2', role: 'SELLER' };

function renderPage(user: AuthenticatedUser | null = null) {
  return renderWithProviders({
    user,
    initialPath: `/cartas/${CARD_ID}`,
    routes: [
      { path: '/cartas/:id', element: <CardProfilePage /> },
      { path: '/login', element: <p>Tela de login</p> },
      { path: '/cadastro', element: <p>Tela de cadastro</p> },
      { path: '/anuncios/:id', element: <p>Detalhe do anúncio</p> },
      { path: '/anuncios/novo', element: <p>Criar anúncio</p> },
    ],
  });
}

function withCard(card: CardProfile, items: ListingSummary[] = listings) {
  vi.mocked(api).get.mockResolvedValue(card);
  vi.mocked(api).getPage.mockResolvedValue({
    data: items,
    meta: { page: 1, pageSize: 20, total: items.length, totalPages: 1 },
  });
}

describe('CardProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withCard(messi);
  });

  afterEach(() => vi.restoreAllMocks());

  it('CA1: o visitante vê imagens, mercado, identificação, histórico e anúncios', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Lionel Messi' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Lionel Messi' })).toHaveAttribute(
      'src',
      'https://cdn/frente.png',
    );
    expect(screen.getByRole('button', { name: 'Ver imagem 2 de 2' })).toBeVisible();
    const market = screen.getByRole('region', { name: 'Mercado' });
    expect(within(market).getByText('R$ 2.100')).toBeVisible();
    expect(within(market).getByText('R$ 1.750')).toBeVisible();
    expect(within(market).getByText('4')).toBeVisible();
    expect(screen.getByText('Copa do Mundo 2026', { selector: 'dd' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Histórico de preços' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Anúncios disponíveis (4)' })).toBeVisible();
    expect(await screen.findByText('tiago_trocas')).toBeVisible();
  });

  it('R17: mostra o caminho, os selos e o subtítulo da carta', async () => {
    renderPage();

    const breadcrumb = await screen.findByRole('navigation', { name: 'Caminho' });
    expect(breadcrumb).toHaveTextContent(
      'Início / Marketplace / Futebol / Copa do Mundo 2026 / Lionel Messi',
    );
    const badges = within(screen.getByRole('list', { name: 'Selos' })).getAllByRole('listitem');
    expect(badges.map((badge) => badge.textContent)).toEqual([
      'Lendária',
      'Copa do Mundo 2026',
      'Seleções',
    ]);
    expect(screen.getByText('Nº 10 • Copa do Mundo 2026')).toBeVisible();
  });

  it('CA4: o visitante que seleciona Favoritar vê o modal e entra com e-mail e senha', async () => {
    const router = renderPage();
    expect(await screen.findByText(GUEST_NOTICE)).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Favoritar' }));
    const dialog = screen.getByRole('dialog', { name: 'Entre para continuar' });
    expect(within(dialog).getByText('Faça login para continuar. É rápido e grátis.')).toBeVisible();
    await userEvent.click(within(dialog).getByRole('link', { name: 'Entrar com e-mail e senha' }));

    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.search).toBe(`?redirect=%2Fcartas%2F${CARD_ID}`);
  });

  it('CA5: o visitante que seleciona Adicionar à coleção vê o modal', async () => {
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Adicionar à coleção' }));

    expect(screen.getByRole('dialog', { name: 'Entre para continuar' })).toBeVisible();
  });

  it('L16: Criar conta grátis guarda a carta para voltar depois do login', async () => {
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Favoritar' }));

    await userEvent.click(screen.getByRole('link', { name: 'Criar conta grátis' }));

    expect(await screen.findByText('Tela de cadastro')).toBeVisible();
    expect(sessionStorage.getItem('cromocard:redirect-after-login')).toContain(
      `"path":"/cartas/${CARD_ID}"`,
    );
  });

  it('CA6: o cliente logado não vê o aviso e não abre o modal', async () => {
    renderPage(customer);

    await userEvent.click(await screen.findByRole('button', { name: 'Favoritar' }));

    expect(screen.queryByText(GUEST_NOTICE)).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Entre para continuar' })).not.toBeInTheDocument();
    expect(screen.getByText('Disponível em breve.')).toBeVisible();
  });

  it('CA3: Ver anúncio abre o detalhe daquele anúncio', async () => {
    const router = renderPage();

    const row = (await screen.findByText('ana_cards')).closest('li') as HTMLElement;
    await userEvent.click(within(row).getByRole('link', { name: 'Ver anúncio' }));

    expect(router.state.location.pathname).toBe('/anuncios/l2');
  });

  it('CA7: sem anúncios, informa que não há e esconde Anunciar esta carta do visitante', async () => {
    withCard(
      {
        ...messi,
        market: { averagePrice: null, lowestListingPrice: null, activeListingsCount: 0 },
      },
      [],
    );
    renderPage();

    expect(await screen.findByText('Ainda não há anúncios ativos para esta carta.')).toBeVisible();
    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.queryByRole('link', { name: 'Anunciar esta carta' })).not.toBeInTheDocument();
  });

  it('CA7: o vendedor logado vê Anunciar esta carta quando não há anúncios', async () => {
    withCard({ ...messi, market: { ...messi.market, activeListingsCount: 0 } }, []);
    const router = renderPage(seller);

    await userEvent.click(await screen.findByRole('link', { name: 'Anunciar esta carta' }));

    expect(router.state.location.pathname).toBe('/anuncios/novo');
  });

  it('CA8: carta não encontrada mostra a mensagem própria', async () => {
    vi.mocked(api).get.mockRejectedValue(
      new ApiError({ status: 404, code: 'CARD_NOT_FOUND', message: 'Carta não encontrada' }),
    );
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Carta não encontrada' })).toBeVisible();
  });

  it('mostra o erro quando a API falha', async () => {
    vi.mocked(api).get.mockRejectedValue(
      new ApiError({ status: 500, code: 'INTERNAL', message: 'Erro' }),
    );
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar a carta.',
    );
  });

  it('mostra o carregando enquanto busca a carta', () => {
    vi.mocked(api).get.mockReturnValue(new Promise(() => undefined));
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Carregando carta…');
  });

  it('R15: Ver anúncios leva até a lista de anúncios', async () => {
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: () => undefined,
    });
    const scrollIntoView = vi
      .spyOn(Element.prototype, 'scrollIntoView')
      .mockImplementation(() => undefined);
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Ver anúncios (4)' }));

    expect(scrollIntoView).toHaveBeenCalledOnce();
    expect(scrollIntoView.mock.contexts[0]).toHaveAttribute('id', 'anuncios');
  });

  it('fecha o modal e o aviso de em breve', async () => {
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: 'Favoritar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('o cliente logado fecha o aviso de em breve', async () => {
    renderPage(customer);
    await userEvent.click(await screen.findByRole('button', { name: 'Adicionar à coleção' }));

    await userEvent.click(screen.getByRole('button', { name: 'Fechar aviso' }));

    expect(screen.queryByText('Disponível em breve.')).not.toBeInTheDocument();
  });

  it('mostra o traço nos dados de identificação que a carta não tem', async () => {
    withCard({
      ...messi,
      identification: { number: null, album: null, category: null, rarity: null, language: null },
    });
    renderPage();

    const identification = await screen.findByLabelText('Identificação da carta');
    expect(within(identification).getAllByText('—')).toHaveLength(5);
  });
});
