import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usersRoutes } from '@/features/users';
import { renderWithProviders } from '@/test/renderWithProviders';

import { notificationsApi } from '../../notifications.api';
import { NOTIFICATION_EVENTS, type NotificationPreferences } from '../../notifications.types';

vi.mock('../../notifications.api', () => ({
  notificationsApi: {
    getPreferences: vi.fn(),
    savePreferences: vi.fn(),
    restorePreferences: vi.fn(),
  },
}));
vi.mock('@/features/users/users.api', () => ({
  usersApi: { getMe: vi.fn().mockResolvedValue({ name: 'Ana', email: 'ana@cromocard.dev' }) },
}));

const api = vi.mocked(notificationsApi);

const allOn = (): NotificationPreferences => ({
  channels: { inApp: true, email: true },
  events: NOTIFICATION_EVENTS.map((event) => ({ event, inApp: true, email: true })),
});

const groupInvitesEmail = () =>
  screen.findByRole('switch', { name: 'Convite para entrar em novo grupo: E-mail' });

function renderPage() {
  renderWithProviders({ routes: usersRoutes, initialPath: '/configuracoes' });
}

describe('NotificationSettingsPage', () => {
  beforeEach(() => {
    api.getPreferences.mockResolvedValue(allOn());
    api.savePreferences.mockImplementation((preferences) => Promise.resolve(preferences));
    api.restorePreferences.mockResolvedValue(undefined);
  });

  it('mostra as duas chaves gerais, os três grupos com seis eventos e o e-mail da conta', async () => {
    renderPage();

    expect(await screen.findByRole('switch', { name: 'In-App (Central & Sino)' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'E-mail' })).toBeChecked();
    expect(screen.getAllByRole('switch')).toHaveLength(2 + 6 * 2);
    expect(screen.getByText('Canais ativos: 2')).toBeInTheDocument();
    expect(await screen.findByText('ana@cromocard.dev')).toBeInTheDocument();
    for (const group of ['Pedidos e marketplace', 'Comunidades', 'Plataforma e coleção']) {
      expect(
        within(screen.getByRole('region', { name: group })).getAllByRole('listitem'),
      ).toHaveLength(2);
    }
  });

  it('CA8: desligar o e-mail de "Convite para entrar em novo grupo" e salvar grava a escolha', async () => {
    renderPage();

    await userEvent.click(await groupInvitesEmail());
    await userEvent.click(screen.getByRole('button', { name: 'Salvar Preferências' }));

    const [saved] = api.savePreferences.mock.calls[0] ?? [];
    expect(saved?.events.find(({ event }) => event === 'GROUP_INVITES')).toEqual({
      event: 'GROUP_INVITES',
      inApp: true,
      email: false,
    });
    expect(await screen.findByText('Preferências salvas.')).toBeInTheDocument();
    expect(await groupInvitesEmail()).not.toBeChecked();
  });

  it('CA8: ao reabrir, a escolha gravada continua desligada', async () => {
    const stored = allOn();
    stored.events = stored.events.map((item) =>
      item.event === 'GROUP_INVITES' ? { ...item, email: false } : item,
    );
    api.getPreferences.mockResolvedValue(stored);
    renderPage();

    expect(await groupInvitesEmail()).not.toBeChecked();
  });

  it('CA8: "Restaurar Padrões" volta tudo a ligado', async () => {
    api.getPreferences.mockResolvedValueOnce({
      ...allOn(),
      channels: { inApp: true, email: false },
    });
    renderPage();

    expect(await screen.findByText('Canais ativos: 1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Restaurar Padrões' }));

    expect(api.restorePreferences).toHaveBeenCalled();
    expect(await screen.findByText('Canais ativos: 2')).toBeInTheDocument();
    expect(screen.getByText('Padrões restaurados: tudo ligado.')).toBeInTheDocument();
  });

  it('com a chave geral do e-mail desligada, as chaves de e-mail dos eventos ficam desativadas', async () => {
    renderPage();

    await userEvent.click(await screen.findByRole('switch', { name: 'E-mail' }));

    expect(await groupInvitesEmail()).toBeDisabled();
    expect(
      screen.getByRole('switch', { name: 'Convite para entrar em novo grupo: In-App' }),
    ).toBeEnabled();
    expect(screen.getByText('Canais ativos: 1')).toBeInTheDocument();
    expect(screen.getByText('Badge: Ativo')).toBeInTheDocument();
  });

  it('desligar o site muda o selo para "Inativo" e desativa as chaves do site nos eventos', async () => {
    renderPage();

    await userEvent.click(await screen.findByRole('switch', { name: 'In-App (Central & Sino)' }));

    expect(screen.getByText('Badge: Inativo')).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'Convite para entrar em novo grupo: In-App' }),
    ).toBeDisabled();
    expect(await groupInvitesEmail()).toBeEnabled();
  });

  it('"Cancelar" desfaz o que não foi salvo', async () => {
    renderPage();

    await userEvent.click(await groupInvitesEmail());
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(await groupInvitesEmail()).toBeChecked();
    expect(api.savePreferences).not.toHaveBeenCalled();
  });

  it('avisa quando não consegue salvar', async () => {
    api.savePreferences.mockRejectedValue(new Error('falhou'));
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: 'Salvar Preferências' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar as preferências. Tente de novo.',
    );
  });

  it('mostra o carregamento e o erro da busca', async () => {
    api.getPreferences.mockRejectedValue(new Error('falhou'));
    renderPage();

    expect(await screen.findByText('Carregando preferências…')).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar as preferências. Tente de novo.',
    );
  });
});
