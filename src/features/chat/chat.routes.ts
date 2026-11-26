import { createElement } from 'react';
import type { RouteObject } from 'react-router';

import { underConstructionRoute } from '@/components/UnderConstructionPage/underConstructionRoute';
import { RequireRole } from '@/routes/guards/RequireRole';
import { paths } from '@/routes/paths';

export const chatRoutes: RouteObject[] = [
  {
    element: createElement(RequireRole, { role: ['CUSTOMER', 'SELLER'] }),
    children: [
      {
        path: paths.messages,
        lazy: async () => ({
          Component: (await import('./pages/MessagesPage/MessagesPage')).MessagesPage,
        }),
      },
    ],
  },
];

export const chatPublicRoutes: RouteObject[] = [
  underConstructionRoute({
    path: paths.publicProfile,
    title: 'Perfil do colecionador',
    story: 'CCD080',
  }),
];
