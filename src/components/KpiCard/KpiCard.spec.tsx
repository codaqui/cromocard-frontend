import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { KpiCard } from './KpiCard';

describe('KpiCard', () => {
  it('mostra o indicador como região nomeada pelo rótulo', () => {
    render(<KpiCard label="Usuários ativos" value="1.284" hint="Últimos 30 dias" />);

    const card = screen.getByRole('region', { name: 'Usuários ativos' });
    expect(card).toHaveTextContent('1.284');
    expect(card).toHaveTextContent('Últimos 30 dias');
  });

  it('não mostra a dica quando não há', () => {
    render(<KpiCard label="Cartas cadastradas" value={42} />);

    expect(screen.getByRole('region', { name: 'Cartas cadastradas' })).toHaveTextContent(
      /^Cartas cadastradas42$/,
    );
  });

  it('mostra a unidade e a tendência', () => {
    render(
      <KpiCard
        label="Total de usuários"
        value="48.920"
        unit="ativos"
        trend={{ label: '+12,4%', tone: 'success' }}
      />,
    );

    const card = screen.getByRole('region', { name: 'Total de usuários' });
    expect(card).toHaveTextContent('48.920 ativos');
    expect(screen.getByText('+12,4%')).toHaveAttribute('data-tone', 'success');
  });
});
