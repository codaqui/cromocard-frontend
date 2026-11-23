import type { RouteObject } from 'react-router';

import { underConstructionRoute } from '@/components/UnderConstructionPage/underConstructionRoute';
import { paths } from '@/routes/paths';

export const marketplaceRoutes: RouteObject[] = [
  underConstructionRoute({
    path: paths.listingDetail,
    title: 'Detalhe do anúncio',
    story: 'CCD079',
  }),
];

export const marketplaceCustomerRoutes: RouteObject[] = [
  underConstructionRoute({ path: paths.newListing, title: 'Criar anúncio', story: 'CCD084' }),
];
