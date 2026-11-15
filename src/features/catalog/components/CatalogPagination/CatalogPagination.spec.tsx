import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CatalogPagination } from './CatalogPagination';

const meta = (page: number, totalPages: number, total = totalPages * 20) => ({
  page,
  pageSize: 20,
  total,
  totalPages,
});

describe('CatalogPagination', () => {
  it('CA1: com muitas páginas, mostra as reticências e marca a página atual', async () => {
    const onPageChange = vi.fn();
    render(<CatalogPagination meta={meta(5, 10)} shown={20} onPageChange={onPageChange} />);

    expect(screen.getByText('…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 5' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByText('81 - 100')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Última página' }));
    expect(onPageChange).toHaveBeenCalledWith(10);
  });

  it('R3: lista vazia mostra 0 - 0 e não mostra os botões', () => {
    render(<CatalogPagination meta={meta(1, 0, 0)} shown={0} onPageChange={vi.fn()} />);

    expect(screen.getByText('0 - 0')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
