import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

export const settingsRoutes: RouteObject[] = [
  {
    path: paths.backoffice.settings,
    lazy: async () => ({
      Component: (await import('./pages/SettingsPage/SettingsPage')).SettingsPage,
    }),
  },
];
