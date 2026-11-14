import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SellerCredentialingCard } from './SellerCredentialingCard';

describe('SellerCredentialingCard', () => {
  it('CA8: mostra 3 aprovados e conversão de 75%', () => {
    render(<SellerCredentialingCard approved={3} pending={1} conversionRate={0.75} />);

    const card = screen.getByRole('region', { name: 'Lojistas & Credenciamento' });
    expect(card).toHaveTextContent('75%');
    expect(card).toHaveTextContent('3');
    expect(card).toHaveTextContent('1');
  });

  it('tem o atalho "Analisar Fila"', () => {
    render(<SellerCredentialingCard approved={0} pending={0} conversionRate={0} />);

    expect(screen.getByRole('link', { name: 'Analisar Fila' })).toHaveAttribute(
      'href',
      '#vendedores-recentes',
    );
  });
});
