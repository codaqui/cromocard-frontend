import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api-error';

import { listingsApi } from '../../listings.api';
import type { CardOption } from '../../listings.types';
import { cardPage, charizard } from '../../test/listingsFixtures';
import { CardCatalogPicker } from './CardCatalogPicker';

vi.mock('../../listings.api', () => ({ listingsApi: { searchCards: vi.fn() } }));

const onChange = vi.fn();
const CHARIZARD_LABEL = 'Charizard VMAX Shiny Secret - Shining Fates (SV107/SV122)';

function Picker({ error }: { error?: string }) {
  const [card, setCard] = useState<CardOption | null>(null);
  const change = (value: CardOption | null) => {
    onChange(value);
    setCard(value);
  };
  return <CardCatalogPicker value={card} onChange={change} error={error} />;
}

function renderPicker(error?: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Picker error={error} />
    </QueryClientProvider>,
  );
  return screen.getByRole('combobox', { name: 'Carta do catálogo' });
}

describe('CardCatalogPicker', () => {
  beforeEach(() => {
    onChange.mockReset();
    vi.mocked(listingsApi.searchCards)
      .mockReset()
      .mockResolvedValue(cardPage([charizard]));
  });

  it('CA15: escolhe a carta da busca e mostra a ajuda do catálogo oficial', async () => {
    const input = renderPicker();
    await userEvent.type(input, 'char');
    await userEvent.click(await screen.findByRole('button', { name: CHARIZARD_LABEL }));

    expect(listingsApi.searchCards).toHaveBeenCalledWith('char');
    expect(onChange).toHaveBeenLastCalledWith(charizard);
    expect(input).toHaveValue(CHARIZARD_LABEL);
    expect(
      screen.getByText('Identificada no catálogo oficial Pokémon TCG • Shining Fates'),
    ).toBeInTheDocument();
  });

  it('R4: só busca com 2 letras e avisa quando nada é encontrado', async () => {
    vi.mocked(listingsApi.searchCards).mockResolvedValue(cardPage([]));
    const input = renderPicker();
    await userEvent.type(input, 'c');
    expect(listingsApi.searchCards).not.toHaveBeenCalled();

    await userEvent.type(input, 'x');

    expect(await screen.findByText('Nenhuma carta encontrada no catálogo.')).toBeInTheDocument();
  });

  it('R3: digitar de novo desfaz a escolha', async () => {
    const input = renderPicker();
    await userEvent.type(input, 'char');
    await userEvent.click(await screen.findByRole('button', { name: CHARIZARD_LABEL }));
    await userEvent.type(input, 'x');

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByText(/Identificada no catálogo/)).not.toBeInTheDocument();
  });

  it('mostra o erro da busca e o erro do campo', async () => {
    vi.mocked(listingsApi.searchCards).mockRejectedValue(
      new ApiError({ status: 500, code: 'INTERNAL', message: 'Falhou' }),
    );
    const input = renderPicker('Escolha a carta no catálogo');
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha a carta no catálogo');

    await userEvent.type(input, 'char');

    expect(await screen.findByText('Não foi possível buscar as cartas.')).toBeInTheDocument();
  });
});
