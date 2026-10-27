import type { RouteObject } from 'react-router';

import { underConstructionRoute } from '@/components/UnderConstructionPage/underConstructionRoute';
import { paths } from '@/routes/paths';

export const requestsRoutes: RouteObject[] = [
  underConstructionRoute({
    path: paths.backoffice.requests,
    title: 'Solicitações',
    story: 'CCD064',
  }),
];
