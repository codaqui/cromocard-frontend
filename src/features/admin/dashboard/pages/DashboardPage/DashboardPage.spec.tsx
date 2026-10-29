import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { DashboardPage } from './DashboardPage';

describe('DashboardPage provisória', () => {
  it('mostra os componentes compartilhados do BackOffice', async () => {
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Em construção')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Período' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Usuários ativos' })).toBeInTheDocument();
    expect(screen.getByRole('tablist', { name: 'Exemplo de tabela' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Vendedores de exemplo' })).toHaveTextContent(
      'Pendente',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar aviso' }));
    expect(screen.getByRole('status')).toHaveTextContent('Aviso de exemplo');
  });
});
