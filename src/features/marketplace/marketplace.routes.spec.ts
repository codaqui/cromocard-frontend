import { describe, expect, it } from 'vitest';

import { paths } from '@/routes/paths';

import { sellerRoutes } from './marketplace.routes';

describe('sellerRoutes', () => {
  it('junta as rotas da conta de recebimento e a loja pública em construção (CCD080)', () => {
    expect(sellerRoutes.map(({ path }) => path)).toEqual([
      paths.seller.overview,
      paths.seller.stripeReturn,
      paths.seller.stripeRefresh,
      paths.seller.store,
    ]);
  });
});
