import type { RouteObject } from 'react-router';

import { underConstructionRoute } from '@/components/UnderConstructionPage/underConstructionRoute';
import { paths } from '@/routes/paths';

import { requestsRoutes } from './requests';

export const catalogBackofficeRoutes: RouteObject[] = [
  underConstructionRoute({ path: paths.backoffice.catalog, title: 'Catálogo', story: 'CCD061' }),
  ...requestsRoutes,
];
