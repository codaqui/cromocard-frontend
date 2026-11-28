import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { PricingCard } from './PricingCard';

const routes = [
  { path: paths.howItWorks, element: <PricingCard /> },
  { path: paths.register, element: <h1>Cadastro</h1> },
];

describe('PricingCard', () => {
  it('CA6: mostra 0% para comprar e 5% por venda', () => {
    renderWithProviders({ routes, initialPath: paths.howItWorks });

    expect(screen.getByRole('heading', { name: 'Quanto custa?' })).toBeInTheDocument();
    expect(screen.getByText('Para comprar').nextSibling).toHaveTextContent('0%');
    expect(screen.getByText('Por venda').nextSibling).toHaveTextContent('5%');
  });

  it('CA8: "Criar conta grátis" abre o cadastro', async () => {
    renderWithProviders({ routes, initialPath: paths.howItWorks });

    await userEvent.click(screen.getByRole('link', { name: 'Criar conta grátis' }));

    expect(await screen.findByRole('heading', { name: 'Cadastro' })).toBeInTheDocument();
  });
});
