import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';
import { underConstructionRoute } from '@/routes/underConstructionRoute';

export const settingsRoutes: RouteObject[] = [
  underConstructionRoute({
    path: paths.backoffice.settings,
    title: 'Configurações',
    story: 'CCD066',
  }),
];
