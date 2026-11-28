import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { CardGallery } from './CardGallery';

describe('CardGallery', () => {
  it('L1: a miniatura troca a imagem principal', async () => {
    render(<CardGallery name="Messi" images={['https://cdn/f.png', 'https://cdn/v.png']} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ver imagem 2 de 2' }));

    expect(screen.getByRole('img', { name: 'Messi' })).toHaveAttribute('src', 'https://cdn/v.png');
    expect(screen.getByRole('button', { name: 'Ver imagem 2 de 2' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('sem imagens, mostra o aviso e nenhuma miniatura', () => {
    render(<CardGallery name="Messi" images={[]} />);

    expect(screen.getByText('Sem imagem')).toBeVisible();
    expect(screen.queryByRole('list', { name: 'Imagens da carta' })).not.toBeInTheDocument();
  });
});
