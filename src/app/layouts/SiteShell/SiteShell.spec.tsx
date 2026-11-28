import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { AuthenticatedUser } from '@/types/authenticated-user';

import { SiteShell } from './SiteShell';

const getStripeAccount = vi.hoisted(() => vi.fn());

vi.mock('@/features/marketplace/seller-account/seller-account.api', () => ({
  sellerAccountApi: { get: getStripeAccount, createOnboardingLink: vi.fn(), refresh: vi.fn() },
}));

const routes = [
  {
    element: <SiteShell />,
    children: [
      { path: paths.home, element: <h1>Início</h1> },
      { path: paths.search, element: <h1>Pesquisar</h1> },
      { path: paths.profile, element: <h1>Meu perfil</h1> },
      { path: paths.backoffice.root, element: <h1>Painel administrativo</h1> },
    ],
  },
];

function renderShell(user: AuthenticatedUser | null = null, signOut = vi.fn()) {
  return renderWithProviders({ routes, initialPath: paths.home, user, signOut });
}

describe('SiteShell', () => {
  beforeEach(() => {
    getStripeAccount.mockResolvedValue({
      status: 'NOT_CONNECTED',
      pendingReason: null,
    });
  });

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
      'Sugestões',
      'Perfil',
      'Configurações',
      'Suporte',
    ]);
    expect(within(menu).getByRole('link', { name: 'Início' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it.each([
    ['CUSTOMER', true],
    ['SELLER', true],
    ['ADMIN', false],
  ] as const)(
    'CCD103 R1: o item Sugestões para %s aparece = %s (o admin não vota)',
    (role, shown) => {
      renderShell({ id: '1', role });

      const menu = screen.getByRole('navigation', { name: 'Menu principal' });
      expect(within(menu).queryByRole('link', { name: 'Sugestões' }) !== null).toBe(shown);
    },
  );

  it.each([
    ['SELLER', true],
    ['CUSTOMER', false],
    ['ADMIN', false],
  ] as const)(
    'CCD108 R2: o grupo Vendedor com a Visão geral para %s aparece = %s',
    (role, shown) => {
      renderShell({ id: '1', role });

      const menu = screen.getByRole('navigation', { name: 'Menu principal' });
      expect(within(menu).queryByRole('group', { name: 'Vendedor' }) !== null).toBe(shown);
      expect(within(menu).queryByRole('link', { name: 'Visão geral' })?.getAttribute('href')).toBe(
        shown ? paths.seller.overview : undefined,
      );
    },
  );

  it.each([
    ['NOT_CONNECTED', false],
    ['VERIFYING', false],
    ['READY', true],
  ] as const)(
    'CCD108 R2: o Criar Anúncio do topo do vendedor com a conta %s fica habilitado = %s',
    async (status, enabled) => {
      getStripeAccount.mockResolvedValue({ status, pendingReason: null });
      renderShell({ id: '1', role: 'SELLER' });

      const button = screen.getByRole('button', { name: 'Criar Anúncio' });
      await vi.waitFor(() => expect(getStripeAccount).toHaveBeenCalled());
      await vi.waitFor(() => expect(button.hasAttribute('disabled')).toBe(!enabled));
      if (!enabled) {
        expect(button).toHaveAccessibleDescription(
          'Conecte sua conta de recebimento para publicar anúncios',
        );
      }
    },
  );

  it.each(['CUSTOMER', 'ADMIN'] as const)('o Criar Anúncio do topo não aparece para %s', (role) => {
    renderShell({ id: '1', role });

    expect(screen.queryByRole('button', { name: 'Criar Anúncio' })).not.toBeInTheDocument();
    expect(getStripeAccount).not.toHaveBeenCalled();
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

  it('o menu da conta leva ao perfil', async () => {
    renderShell({ id: '1', role: 'CUSTOMER' });

    await userEvent.click(screen.getByRole('button', { name: 'Cliente' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Meu perfil' }));

    expect(await screen.findByRole('heading', { name: 'Meu perfil' })).toBeInTheDocument();
  });

  it('o administrador chega ao BackOffice pelo menu da conta', async () => {
    renderShell({ id: '1', role: 'ADMIN' });

    await userEvent.click(screen.getByRole('button', { name: 'Administrador' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'BackOffice' }));

    expect(
      await screen.findByRole('heading', { name: 'Painel administrativo' }),
    ).toBeInTheDocument();
  });
});
