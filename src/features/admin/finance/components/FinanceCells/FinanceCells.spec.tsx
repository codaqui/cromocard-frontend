import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  AveragePriceCell,
  GroupVolumeCell,
  ListedVolumeCell,
  PopulationCell,
  ReputationCell,
} from './FinanceCells';

const seller = { id: 's1', listedVolumeCents: 0, activeListings: 0, rating: null, reviews: 0 };

describe('FinanceCells', () => {
  it('CA5: mostra a média das notas e o volume anunciado do vendedor', () => {
    render(
      <>
        <ReputationCell stats={{ ...seller, rating: 4.25, reviews: 8 }} />
        <ListedVolumeCell stats={{ ...seller, listedVolumeCents: 125000, activeListings: 3 }} />
      </>,
    );

    expect(screen.getByLabelText('Nota 4,3 de 5, 8 avaliações')).toHaveTextContent('★★★★☆4,3');
    expect(screen.getByText(/R\$\s1\.250/)).toBeInTheDocument();
    expect(screen.getByText('3 anúncios ativos')).toBeInTheDocument();
  });

  it('vendedor sem anúncio nem avaliação mostra R$ 0 e "Nenhum anúncio ativo", como no Figma', () => {
    render(
      <>
        <ReputationCell stats={seller} />
        <ListedVolumeCell stats={seller} />
      </>,
    );

    expect(screen.getByLabelText('Nota 0 de 5, 0 avaliações')).toHaveTextContent('☆☆☆☆☆0');
    expect(screen.getByText(/R\$\s0$/)).toBeInTheDocument();
    expect(screen.getByText('Nenhum anúncio ativo')).toBeInTheDocument();
  });

  it('CA6: mostra a população em unidades e o preço médio de 30 dias da carta', () => {
    const card = { id: 'c1', averagePriceCents: 14500000, prices: 4, population: 3 };
    render(
      <>
        <PopulationCell stats={card} />
        <AveragePriceCell stats={card} />
      </>,
    );

    expect(screen.getByText('3 un.')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s145\.000,00/)).toBeInTheDocument();
    expect(screen.getByText('média 30 dias')).toBeInTheDocument();
  });

  it('carta sem preço nos últimos 30 dias mostra um traço', () => {
    render(
      <AveragePriceCell stats={{ id: 'c1', averagePriceCents: null, prices: 0, population: 0 }} />,
    );

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('R10: mostra o volume e as negociações ativas do grupo', () => {
    render(
      <GroupVolumeCell
        stats={{ id: 'g1', negotiatedVolumeCents: 41890000, activeNegotiations: 1 }}
      />,
    );

    expect(screen.getByText(/R\$\s418\.900,00/)).toBeInTheDocument();
    expect(screen.getByText('1 negociação ativa')).toBeInTheDocument();
  });

  it('enquanto os números não chegam, mostra um traço', () => {
    render(<GroupVolumeCell />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
