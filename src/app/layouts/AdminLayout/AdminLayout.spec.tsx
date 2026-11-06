import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { adminBackofficeRoutes } from '@/features/admin';
import { catalogBackofficeRoutes } from '@/features/catalog';
import { communityBackofficeRoutes } from '@/features/community';
import { notificationsBackofficeRoutes } from '@/features/notifications';
import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { AdminLayout } from './AdminLayout';

const routes = [
  {
    element: <AdminLayout />,
    children: [
      ...adminBackofficeRoutes,
      ...notificationsBackofficeRoutes,
      ...catalogBackofficeRoutes,
      ...communityBackofficeRoutes,
      { path: paths.backoffice.users, element: <h1>Usuários</h1> },
    ],
  },
  { path: paths.home, element: <p>Área pública</p> },
];

const underConstructionModules = [
  { label: 'Notificação', story: 'CCD060' },
  { label: 'Catálogo', story: 'CCD061' },
  { label: 'Comunidades', story: 'CCD062' },
  { label: 'Relatórios', story: 'CCD063' },
  { label: 'Solicitações', story: 'CCD064' },
  { label: 'Logs', story: 'CCD065' },
  { label: 'Configurações', story: 'CCD066' },
];

function renderBackoffice(initialPath: string = paths.backoffice.dashboard) {
  return renderWithProviders({ routes, initialPath, user: { id: '1', role: 'ADMIN' } });
}

describe('AdminLayout', () => {
  it('mostra os 9 módulos oficiais na ordem do menu', async () => {
    renderBackoffice();

    const menu = await screen.findByRole('navigation', { name: 'Módulos oficiais' });
    expect(
      within(menu)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual([
      'Dashboard',
      'Usuários',
      'Notificação',
      'Catálogo',
      'Comunidades',
      'Relatórios',
      'Solicitações',
      'Logs',
      'Configurações',
    ]);
  });

  it('abre o Dashboard Gerencial', async () => {
    renderBackoffice();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Visão Executiva & Gerencial' }),
    ).toBeInTheDocument();
  });

  it.each(underConstructionModules)(
    'navega para $label em construção',
    async ({ label, story }) => {
      renderBackoffice();
      const menu = await screen.findByRole('navigation', { name: 'Módulos oficiais' });

      await userEvent.click(within(menu).getByRole('link', { name: label }));

      expect(await screen.findByRole('heading', { level: 1, name: label })).toBeInTheDocument();
      expect(screen.getByText(`Esta tela chega com a user story ${story}.`)).toBeInTheDocument();
      expect(within(menu).getByRole('link', { name: label })).toHaveAttribute(
        'aria-current',
        'page',
      );
    },
  );

  it('CA15: o Sair encerra a sessão e volta para a área pública', async () => {
    const signOut = vi.fn();
    const router = renderWithProviders({
      routes,
      initialPath: paths.backoffice.dashboard,
      user: { id: '1', role: 'ADMIN' },
      signOut,
    });

    await userEvent.click(await screen.findByRole('button', { name: 'Sair' }));

    expect(signOut).toHaveBeenCalledOnce();
    expect(await screen.findByText('Área pública')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.home);
  });
});
