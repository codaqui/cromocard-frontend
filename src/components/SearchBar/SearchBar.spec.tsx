import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SearchBar } from './SearchBar';

const scopes = [
  { value: 'cartas', label: 'Cartas' },
  { value: 'grupos', label: 'Grupos' },
];

describe('SearchBar', () => {
  it('começa no primeiro tipo e envia o termo sem espaços nas pontas', async () => {
    const onSearch = vi.fn();
    render(<SearchBar scopes={scopes} label="Buscar" onSearch={onSearch} />);

    expect(screen.getByRole('button', { name: 'Cartas' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar' }), '  messi {Enter}');

    expect(onSearch).toHaveBeenCalledWith({ term: 'messi', scope: 'cartas' });
  });

  it('troca o tipo da busca', async () => {
    const onSearch = vi.fn();
    render(<SearchBar scopes={scopes} label="Buscar" onSearch={onSearch} />);

    await userEvent.click(screen.getByRole('button', { name: 'Grupos' }));
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar' }), 'one piece{Enter}');

    expect(screen.getByRole('button', { name: 'Grupos' })).toHaveAttribute('aria-pressed', 'true');
    expect(onSearch).toHaveBeenCalledWith({ term: 'one piece', scope: 'grupos' });
  });
});
