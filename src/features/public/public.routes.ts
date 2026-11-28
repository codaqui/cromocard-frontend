import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

export const publicRoutes: RouteObject[] = [
  {
    path: paths.help,
    lazy: async () => ({
      Component: (await import('./help/pages/HelpCenterPage/HelpCenterPage')).HelpCenterPage,
    }),
  },
  {
    path: paths.howItWorks,
    lazy: async () => ({
      Component: (await import('./how-it-works/pages/HowItWorksPage/HowItWorksPage'))
        .HowItWorksPage,
    }),
  },
];
