import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';

import { RecentSellersTable } from './RecentSellersTable';

const sellers = [
  {
    id: '1',
    name: 'Fábio TCG Store',
    email: 'fabio@cromocard.dev',
    createdAt: '2026-10-20T15:00:00Z',
  },
];

describe('RecentSellersTable', () => {
  it('CA4: mostra nome, e-mail, data e o link para a Gestão de Usuários', () => {
    render(
      <MemoryRouter>
        <RecentSellersTable
          sellers={sellers}
          meta={{ page: 1, pageSize: 5, total: 1, totalPages: 1 }}
          onPageChange={vi.fn()}
        />
      </MemoryRouter>,
    );

    const row = screen.getByRole('row', { name: /Fábio TCG Store/ });
    expect(row).toHaveTextContent('fabio@cromocard.dev');
    expect(row).toHaveTextContent('20/10/2026');
    expect(
      within(row).getByRole('link', { name: 'Ver informações de Fábio TCG Store' }),
    ).toHaveAttribute('href', paths.backoffice.users);
  });

  it('CA4: pagina a lista', async () => {
    const onPageChange = vi.fn();
    render(
      <MemoryRouter>
        <RecentSellersTable
          sellers={sellers}
          meta={{ page: 1, pageSize: 1, total: 3, totalPages: 3 }}
          onPageChange={onPageChange}
        />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Próximo' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
