import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from './Pagination';

function renderPagination(page: number, totalPages: number, itemLabel?: string) {
  const onPageChange = vi.fn();
  render(
    <Pagination
      page={page}
      totalPages={totalPages}
      total={totalPages * 20 - 5}
      pageSize={20}
      itemLabel={itemLabel}
      onPageChange={onPageChange}
    />,
  );
  return onPageChange;
}

const pageButtons = () =>
  screen.getAllByRole('button').filter((button) => /^\d+$/.test(button.textContent ?? ''));

describe('Pagination', () => {
  it('com uma página só, não mostra nada', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('na primeira página, mostra 1 a 3, marca a atual e desabilita Anterior', () => {
    renderPagination(1, 10, 'usuários cadastrados');

    expect(pageButtons().map((button) => button.textContent)).toEqual(['1', '2', '3']);
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '2' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    expect(screen.getByText('Mostrando 1 a 20 de 195 usuários cadastrados')).toBeInTheDocument();
  });

  it('no meio, mostra a vizinhança da página atual e navega', async () => {
    const onPageChange = renderPagination(5, 10);

    expect(pageButtons().map((button) => button.textContent)).toEqual(['4', '5', '6']);
    expect(screen.getByText('Mostrando 81 a 100 de 195 registros')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '6' }));
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(onPageChange.mock.calls).toEqual([[6], [4], [6]]);
  });

  it('na última página, mostra as três últimas, o intervalo final e desabilita Próximo', () => {
    renderPagination(10, 10);

    expect(pageButtons().map((button) => button.textContent)).toEqual(['8', '9', '10']);
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeDisabled();
    expect(screen.getByText('Mostrando 181 a 195 de 195 registros')).toBeInTheDocument();
  });

  it('sem total, mostra só os controles', () => {
    render(<Pagination page={2} totalPages={2} onPageChange={vi.fn()} />);
    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument();
  });
});
