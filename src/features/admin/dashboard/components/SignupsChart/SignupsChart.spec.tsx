import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SignupsChart } from './SignupsChart';

describe('SignupsChart', () => {
  it('CA3: mostra as duas séries, clientes e vendedores, por mês', () => {
    render(
      <SignupsChart
        signups={[
          { month: '2026-09', customers: 3, sellers: 1 },
          { month: '2026-10', customers: 0, sellers: 2 },
        ]}
      />,
    );

    const chart = screen.getByRole('img', { name: /Novos cadastros por mês/ });
    expect(chart).toHaveAccessibleName(/set\.\/26: 3 clientes e 1 vendedores/);
    expect(chart).toHaveAccessibleName(/out\.\/26: 0 clientes e 2 vendedores/);
    expect(screen.getByText('Clientes (+3)')).toBeInTheDocument();
    expect(screen.getByText('Vendedores (+3)')).toBeInTheDocument();
  });
});
