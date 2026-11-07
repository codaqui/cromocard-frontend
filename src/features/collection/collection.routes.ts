import type { RouteObject } from 'react-router';

import { underConstructionRoute } from '@/components/UnderConstructionPage/underConstructionRoute';
import { paths } from '@/routes/paths';

export const collectionRoutes: RouteObject[] = [
  underConstructionRoute({ path: paths.albums, title: 'Álbuns', story: 'CCD008' }),
];
