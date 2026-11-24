import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { FinanceSummary } from '../../finance.types';
import { FinanceCards } from './FinanceCards';

const summary: FinanceSummary = {
  period: { from: '2026-11-11T03:00:00Z', to: '2026-11-12T02:59:59Z' },
  custodyCents: 15000,
  settledCents: 8000,
  settledOrders: 1,
  retainedCents: 8000,
  hasMovement: true,
};

function renderCards(overrides: Partial<FinanceSummary> = {}, isToday = false) {
  const onOpenLedger = vi.fn();
  render(
    <FinanceCards
      summary={{ ...summary, ...overrides }}
      isToday={isToday}
      onOpenLedger={onOpenLedger}
    />,
  );
  return { card: screen.getByRole('region', { name: 'Valor em custódia' }), onOpenLedger };
}

describe('FinanceCards', () => {
  it('CA1: mostra a custódia em reais', () => {
    const { card } = renderCards();

    expect(card).toHaveTextContent(/R\$\s150,00/);
  });

  it('CA2: no filtro Hoje, mostra "Liquidado hoje" e o pedido no singular', () => {
    const { card } = renderCards({}, true);

    expect(card).toHaveTextContent('Liquidado hoje');
    expect(card).toHaveTextContent(/R\$\s80,00/);
    expect(card).toHaveTextContent('1 pedido liberado aos vendedores hoje.');
  });

  it('R4: mostra o retido em garantia junto da custódia e do liquidado', () => {
    const { card } = renderCards();

    expect(card).toHaveTextContent(/Retido em GarantiaR\$\s80,00/);
  });

  it('CA4: sem movimentação, zera o liquidado e mostra a mensagem', () => {
    const { card } = renderCards({
      settledCents: 0,
      settledOrders: 0,
      retainedCents: 0,
      hasMovement: false,
    });

    expect(card).toHaveTextContent('Não houve movimentação no período.');
    expect(card).toHaveTextContent(/R\$\s0,00/);
  });

  it('CA3: "Ver Livro Razão de Hoje" abre o livro razão', async () => {
    const { onOpenLedger } = renderCards();

    await userEvent.click(screen.getByRole('button', { name: 'Ver Livro Razão de Hoje' }));

    expect(onOpenLedger).toHaveBeenCalledOnce();
  });
});
