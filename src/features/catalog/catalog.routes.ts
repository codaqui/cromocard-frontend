import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';
import { underConstructionRoute } from '@/routes/underConstructionRoute';

export const catalogBackofficeRoutes: RouteObject[] = [
  underConstructionRoute({ path: paths.backoffice.catalog, title: 'Catálogo', story: 'CCD061' }),
  underConstructionRoute({
    path: paths.backoffice.requests,
    title: 'Solicitações',
    story: 'CCD064',
  }),
];
