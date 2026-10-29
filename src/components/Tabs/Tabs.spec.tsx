import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Tabs } from './Tabs';

const catalogTabs = [
  { id: 'cards', label: 'Cartas' },
  { id: 'albums', label: 'Álbuns' },
  { id: 'categories', label: 'Categorias' },
];

function CatalogTabs() {
  const [activeId, setActiveId] = useState('cards');

  return (
    <Tabs label="Catálogo" items={catalogTabs} activeId={activeId} onChange={setActiveId}>
      <p>Conteúdo de {activeId}</p>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('marca a aba ativa e liga o painel a ela', () => {
    render(<CatalogTabs />);

    expect(screen.getByRole('tab', { name: 'Cartas' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Cartas' })).toHaveTextContent('Conteúdo de cards');
  });

  it('troca de aba pelo clique', async () => {
    render(<CatalogTabs />);

    await userEvent.click(screen.getByRole('tab', { name: 'Álbuns' }));

    expect(screen.getByRole('tab', { name: 'Álbuns' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Conteúdo de albums');
  });

  it('navega pelas setas, Home e End, voltando ao início depois da última', async () => {
    render(<CatalogTabs />);
    await userEvent.click(screen.getByRole('tab', { name: 'Cartas' }));

    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Categorias' })).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Cartas' })).toHaveFocus();

    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Categorias' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Cartas' })).toHaveAttribute('aria-selected', 'true');
  });

  it('mostra o contador ao lado do rótulo da aba', () => {
    render(
      <Tabs
        label="Solicitações"
        items={[{ id: 'cards', label: 'Cartas', count: 3 }]}
        activeId="cards"
        onChange={() => undefined}
      >
        conteúdo
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Cartas 3' })).toBeInTheDocument();
  });
});
