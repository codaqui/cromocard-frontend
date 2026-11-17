import { describe, expect, it } from 'vitest';

import { paths } from '@/routes/paths';

import { settingsRoutes } from './settings.routes';
import { SettingsPage } from './pages/SettingsPage/SettingsPage';

describe('settingsRoutes', () => {
  it('R2: /backoffice/settings carrega a página de Configurações Globais', async () => {
    const [route] = settingsRoutes;

    expect(route?.path).toBe(paths.backoffice.settings);
    const lazy = route?.lazy as () => Promise<{ Component: unknown }>;
    await expect(lazy()).resolves.toEqual({ Component: SettingsPage });
  });
});
