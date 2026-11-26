import type { RouteObject } from 'react-router';

import { underConstructionRoute } from '@/components/UnderConstructionPage/underConstructionRoute';
import { paths } from '@/routes/paths';

import { sellerAccountRoutes } from './seller-account';

/** Rotas do Painel do vendedor; cada subpasta do marketplace soma as suas aqui. */
export const sellerRoutes: RouteObject[] = [
  ...sellerAccountRoutes,
  underConstructionRoute({ path: paths.seller.store, title: 'Loja pública', story: 'CCD080' }),
];
