import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';
import { underConstructionRoute } from '@/routes/underConstructionRoute';

export const communityBackofficeRoutes: RouteObject[] = [
  underConstructionRoute({
    path: paths.backoffice.communities,
    title: 'Comunidades',
    story: 'CCD062',
  }),
];
