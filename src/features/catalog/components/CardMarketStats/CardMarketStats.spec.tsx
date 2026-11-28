import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { CardProfile } from '../../card-profile.types';
import { CardMarketStats } from './CardMarketStats';

const GUEST_NOTICE = /Ainda não tem conta\?/;

const DEFAULT_MARKET: CardProfile['market'] = {
  averagePrice: '2100.00',
  lowestListingPrice: '1750.00',
  activeListingsCount: 4,
};

function renderStats(isGuest: boolean, market = DEFAULT_MARKET) {
  const handlers = { onSeeListings: vi.fn(), onAddToCollection: vi.fn(), onFavorite: vi.fn() };
  render(<CardMarketStats market={market} isGuest={isGuest} {...handlers} />);
  return handlers;
}

describe('CardMarketStats', () => {
  it('CA1: mostra preço médio, menor anúncio e anúncios ativos', () => {
    renderStats(false);

    const stats = screen.getByRole('region', { name: 'Mercado' });
    expect(within(stats).getByText('R$ 2.100')).toBeVisible();
    expect(within(stats).getByText('R$ 1.750')).toBeVisible();
    expect(within(stats).getByText('4')).toBeVisible();
  });

  it('CA7: sem anúncios, mostra traço nos preços e zero anúncios', () => {
    renderStats(false, { averagePrice: null, lowestListingPrice: null, activeListingsCount: 0 });

    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Ver anúncios (0)' })).toBeVisible();
  });

  it('CA4 e CA5: cada botão chama a sua ação', async () => {
    const handlers = renderStats(true);

    await userEvent.click(screen.getByRole('button', { name: 'Ver anúncios (4)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar à coleção' }));
    await userEvent.click(screen.getByRole('button', { name: 'Favoritar' }));

    expect(handlers.onSeeListings).toHaveBeenCalledOnce();
    expect(handlers.onAddToCollection).toHaveBeenCalledOnce();
    expect(handlers.onFavorite).toHaveBeenCalledOnce();
  });

  it('CA6: o aviso para entrar só aparece para o visitante', () => {
    renderStats(true);
    expect(screen.getByText(GUEST_NOTICE)).toBeVisible();
  });

  it('CA6: o cliente logado não vê o aviso para entrar', () => {
    renderStats(false);
    expect(screen.queryByText(GUEST_NOTICE)).not.toBeInTheDocument();
  });
});
