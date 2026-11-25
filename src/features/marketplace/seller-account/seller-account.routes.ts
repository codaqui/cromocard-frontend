import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

export const sellerAccountRoutes: RouteObject[] = [
  {
    path: paths.seller.overview,
    lazy: async () => ({
      Component: (await import('./pages/SellerOverviewPage/SellerOverviewPage')).SellerOverviewPage,
    }),
  },
  {
    path: paths.seller.stripeReturn,
    lazy: async () => ({
      Component: (await import('./pages/StripeReturnPage/StripeReturnPage')).StripeReturnPage,
    }),
  },
  {
    path: paths.seller.stripeRefresh,
    lazy: async () => ({
      Component: (await import('./pages/StripeRefreshPage/StripeRefreshPage')).StripeRefreshPage,
    }),
  },
];
