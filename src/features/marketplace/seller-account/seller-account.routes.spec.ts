import { describe, expect, it } from 'vitest';

import { paths } from '@/routes/paths';

import { sellerAccountRoutes } from './seller-account.routes';

describe('sellerAccountRoutes', () => {
  it('R2: Visão geral do vendedor e as voltas do cadastro na Stripe', async () => {
    expect(sellerAccountRoutes.map(({ path }) => path)).toEqual([
      paths.seller.overview,
      paths.seller.stripeReturn,
      paths.seller.stripeRefresh,
    ]);
    const pages = await Promise.all(
      sellerAccountRoutes.map(async (route) => {
        const lazy = route.lazy as () => Promise<{ Component: { name: string } }>;
        return (await lazy()).Component.name;
      }),
    );
    expect(pages).toEqual(['SellerOverviewPage', 'StripeReturnPage', 'StripeRefreshPage']);
  });
});
