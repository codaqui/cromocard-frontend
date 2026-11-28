import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';

import { NotFoundPage } from './NotFoundPage';

function renderAt(state?: object) {
  const router = createMemoryRouter([{ path: '*', element: <NotFoundPage /> }], {
    initialEntries: [{ pathname: '/albuns/pokemon-base-set-2', state }],
  });
  render(<RouterProvider router={router} />);
}

describe('NotFoundPage', () => {
  it('CA5: vindo de uma notificação, avisa que o conteúdo não está mais disponível', () => {
    renderAt({ fromNotification: true });

    expect(
      screen.getByRole('heading', { name: 'Este conteúdo não está mais disponível.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para as notificações' })).toHaveAttribute(
      'href',
      '/notificacoes',
    );
  });

  it('sem vir de uma notificação, mostra a página não encontrada', () => {
    renderAt();

    expect(screen.getByRole('heading', { name: 'Página não encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para o início' })).toHaveAttribute('href', '/');
  });
});
