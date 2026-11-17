import type { RouteObject } from 'react-router';

import { underConstructionRoute } from '@/components/UnderConstructionPage/underConstructionRoute';
import { paths } from '@/routes/paths';

import { requestsRoutes } from './requests';

export const catalogBackofficeRoutes: RouteObject[] = [
  {
    path: paths.backoffice.catalog,
    lazy: async () => ({
      Component: (await import('./pages/CatalogAdminPage/CatalogAdminPage')).CatalogAdminPage,
    }),
  },
  ...requestsRoutes,
];

export const catalogRoutes: RouteObject[] = [
  underConstructionRoute({ path: paths.highlights, title: 'Destaques', story: 'CCD001' }),
  underConstructionRoute({ path: paths.search, title: 'Pesquisar', story: 'CCD002' }),
  underConstructionRoute({ path: paths.categories, title: 'Categorias', story: 'CCD027' }),
];

/** Páginas do Painel Cliente, só para quem está logado (CCD103, R1). */
export const catalogCustomerRoutes: RouteObject[] = [
  {
    path: paths.suggestions,
    lazy: async () => ({
      Component: (
        await import('./requests/pages/CommunitySuggestionsPage/CommunitySuggestionsPage')
      ).CommunitySuggestionsPage,
    }),
  },
];
