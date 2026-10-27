import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';
import { underConstructionRoute } from '@/components/UnderConstructionPage/underConstructionRoute';

export const reportsRoutes: RouteObject[] = [
  underConstructionRoute({ path: paths.backoffice.reports, title: 'Relatórios', story: 'CCD063' }),
];
