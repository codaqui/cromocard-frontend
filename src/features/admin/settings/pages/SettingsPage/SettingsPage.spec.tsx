import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { settingsApi } from '../../settings.api';
import { SETTING_KEYS, type SettingView } from '../../settings.types';
import { renderSettings } from '../../test/renderSettings';
import { SettingsPage } from './SettingsPage';

vi.mock('../../settings.api', () => ({
  settingsApi: {
    list: vi.fn(),
    updateBanner: vi.fn(),
    listDefaultCategories: vi.fn(),
  },
}));

const BANNER = {
  enabled: true,
  title: 'Semana de Cartas Raras',
  subtitle: 'Confira as cartas raras desta semana.',
  ctaText: 'Ver cartas',
  ctaUrl: 'https://cromocard.com.br/catalogo',
  imageUrl: null,
};

function setting(key: string, value: unknown): SettingView {
  return { key, value, description: null, updatedAt: '2026-11-16T12:00:00Z', updatedBy: null };
}

const SETTINGS = [
  setting(SETTING_KEYS.homeBanner, BANNER),
  setting(SETTING_KEYS.notificationTemplates, [
    { name: 'Novas regras', title: 'Regras', content: 'Leia.' },
  ]),
  setting(SETTING_KEYS.monthlySignupGoal, 4000),
  setting(SETTING_KEYS.votingGoal, 200),
];

beforeEach(() => {
  vi.mocked(settingsApi.list).mockReset();
  vi.mocked(settingsApi.listDefaultCategories).mockResolvedValue([]);
});

describe('SettingsPage', () => {
  it('R2: mostra o cabeçalho e os quatro módulos com os valores atuais', async () => {
    vi.mocked(settingsApi.list).mockResolvedValue(SETTINGS);
    renderSettings(<SettingsPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Configurações Globais' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Carregando as configurações…')).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Módulo 1: Banner da Home' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Módulo 2: Categorias padrão' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Módulo 3: Templates de notificação' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Módulo 4: Metas' })).toBeInTheDocument();
    expect(screen.getByText('Novas regras')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Meta mensal de novos cadastros' })).toHaveValue(
      '4.000',
    );
  });

  it('CA2: depois de salvar o banner, a tela mostra "Banner atualizado"', async () => {
    vi.mocked(settingsApi.list).mockResolvedValue(SETTINGS);
    vi.mocked(settingsApi.updateBanner).mockResolvedValue({} as never);
    const user = userEvent.setup();
    renderSettings(<SettingsPage />);

    await user.click(await screen.findByRole('button', { name: /Salvar banner/ }));

    const notice = await screen.findByRole('status');
    expect(within(notice).getByText('Banner atualizado')).toBeInTheDocument();
    expect(within(notice).getByText(/A Home pública já mostra o banner novo/)).toBeInTheDocument();
    await user.click(within(notice).getByRole('button', { name: 'Fechar aviso' }));
    expect(
      within(screen.getByRole('status')).queryByText('Banner atualizado'),
    ).not.toBeInTheDocument();
  });

  it('R3: sem as chaves no banco, os módulos abrem vazios', async () => {
    vi.mocked(settingsApi.list).mockResolvedValue([]);
    renderSettings(<SettingsPage />);

    expect(await screen.findByRole('textbox', { name: 'Título' })).toHaveValue('');
    expect(screen.getByRole('switch', { name: /Inativo/ })).not.toBeChecked();
  });

  it('R3: erro ao carregar oferece tentar de novo', async () => {
    vi.mocked(settingsApi.list)
      .mockRejectedValueOnce(new Error('Sem conexão'))
      .mockResolvedValue(SETTINGS);
    const user = userEvent.setup();
    renderSettings(<SettingsPage />);

    expect(
      await screen.findByText('Não foi possível carregar as configurações'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(
      await screen.findByRole('heading', { name: 'Módulo 1: Banner da Home' }),
    ).toBeInTheDocument();
  });
});
