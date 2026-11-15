import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AlbumNumberCell, AlbumStatusCell, EditionCell, Thumbnail } from './CatalogCells';

describe('CatalogCells', () => {
  it('L5: mostra o número com o total do álbum, ou só o número sem total', () => {
    const { rerender } = render(<AlbumNumberCell number="4" total={102} />);
    expect(screen.getByText('004')).toBeInTheDocument();
    expect(screen.getByText('102')).toBeInTheDocument();

    rerender(<AlbumNumberCell number="4" />);
    expect(screen.queryByText('/')).not.toBeInTheDocument();
  });

  it('R3: carta avulsa, sem número e sem álbum, mostra travessão', () => {
    const number = render(<AlbumNumberCell number={null} />);
    expect(number.container).toHaveTextContent('—');
    number.unmount();

    const edition = render(<EditionCell />);
    expect(edition.container).toHaveTextContent('—');
  });

  it('R5: mostra o status do álbum em texto', () => {
    render(
      <>
        <AlbumStatusCell status="ACTIVE" />
        <AlbumStatusCell status="INACTIVE" />
      </>,
    );

    expect(screen.getByText('Ativo')).toBeInTheDocument();
    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('R3: sem imagem, a miniatura mostra o ícone no lugar', () => {
    const { container } = render(<Thumbnail imageUrl={null} badge="Rara" />);

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('Rara')).toBeInTheDocument();
  });
});
