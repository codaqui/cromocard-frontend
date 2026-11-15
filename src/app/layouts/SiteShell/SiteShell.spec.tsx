import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { AuthenticatedUser } from '@/types/authenticated-user';

import { SiteShell } from './SiteShell';

const routes = [
  {
    element: <SiteShell />,
    children: [
      { path: paths.home, element: <h1>Início</h1> },
      { path: paths.search, element: <h1>Pesquisar</h1> },
    ],
  },
];

function renderShell(user: AuthenticatedUser | null = null, signOut = vi.fn()) {
  return renderWithProviders({ routes, initialPath: paths.home, user, signOut });
}

describe('SiteShell', () => {
  it('mostra a logo e o menu lateral do protótipo', () => {
    renderShell();

    expect(screen.getByRole('link', { name: 'CromoCard' })).toHaveAttribute('href', paths.home);
    const menu = screen.getByRole('navigation', { name: 'Menu principal' });
    expect(
      within(menu)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual([
      'Início',
      'Pesquisar',
      'Categorias',
      'Álbuns',
      'Comunidades',
      'Perfil',
      'Configurações',
      'Suporte',
    ]);
    expect(within(menu).getByRole('link', { name: 'Início' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('para o visitante, oferece Login, Cadastrar e os atalhos', () => {
    renderShell();

    expect(screen.getByRole('navigation', { name: 'Atalhos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', paths.login);
    expect(screen.getByRole('link', { name: 'Cadastrar' })).toHaveAttribute('href', paths.register);
  });

  it('a busca leva para Pesquisar com o termo e o tipo escolhido', async () => {
    const router = renderShell();

    await userEvent.click(screen.getByRole('button', { name: 'Grupos' }));
    await userEvent.type(screen.getByRole('searchbox'), 'pokemon{Enter}');

    expect(await screen.findByRole('heading', { name: 'Pesquisar' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?q=pokemon&tipo=grupos');
  });

  it('para quem entrou, o menu da conta tem o Sair', async () => {
    const signOut = vi.fn();
    renderShell({ id: '1', role: 'CUSTOMER' }, signOut);

    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Atalhos' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cliente' }));
    expect(screen.queryByRole('menuitem', { name: 'BackOffice' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sair' }));

    expect(signOut).toHaveBeenCalledOnce();
  });

  it('para o administrador, o menu da conta leva ao BackOffice', async () => {
    renderShell({ id: '1', role: 'ADMIN' });

    await userEvent.click(screen.getByRole('button', { name: 'Administrador' }));

    expect(screen.getByRole('menuitem', { name: 'BackOffice' })).toBeInTheDocument();
  });
});
