import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { paths } from '@/routes/paths';
import { renderWithProviders } from '@/test/renderWithProviders';

import { chatRoutes } from './chat.routes';

vi.mock('./pages/MessagesPage/MessagesPage', () => ({
  MessagesPage: () => <p>Página de mensagens</p>,
}));

const routes = [
  { path: paths.profile, element: <p>Perfil</p> },
  { path: paths.backoffice.dashboard, element: <p>Painel</p> },
  ...chatRoutes,
];

describe('chatRoutes', () => {
  it('R1: cliente e vendedor abrem Mensagens', async () => {
    renderWithProviders({ routes, initialPath: paths.messages, user: { id: '1', role: 'SELLER' } });

    expect(await screen.findByText('Página de mensagens')).toBeInTheDocument();
  });

  it('CA7: o administrador vai para a home dele', async () => {
    const router = renderWithProviders({
      routes,
      initialPath: paths.messages,
      user: { id: '1', role: 'ADMIN' },
    });

    expect(await screen.findByText('Painel')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(paths.backoffice.dashboard);
  });
});
