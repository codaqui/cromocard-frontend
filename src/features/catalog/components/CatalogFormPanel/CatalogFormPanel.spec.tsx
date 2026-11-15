import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CatalogFormPanel } from './CatalogFormPanel';

describe('CatalogFormPanel', () => {
  it('nomeia a seção pelo título e mostra o texto à direita', () => {
    render(
      <CatalogFormPanel icon="image" title="Imagens" aside="Mín. 1200×1600 px">
        <p>conteúdo</p>
      </CatalogFormPanel>,
    );

    expect(screen.getByRole('region', { name: 'Imagens' })).toHaveTextContent('conteúdo');
    expect(screen.getByText('Mín. 1200×1600 px')).toBeInTheDocument();
  });

  it('sem texto à direita, mostra só o título', () => {
    render(
      <CatalogFormPanel icon="shield" title="Dados da carta">
        <p>campos</p>
      </CatalogFormPanel>,
    );

    expect(screen.getByRole('heading', { name: 'Dados da carta' })).toBeInTheDocument();
  });
});
