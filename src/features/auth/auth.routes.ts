import { createElement } from 'react';
import type { RouteObject } from 'react-router';

import { paths } from '@/routes/paths';

import { AuthLayout } from './components/AuthLayout/AuthLayout';
import type { AuthTab } from './auth.labels';

function authPageRoute(path: string, tab: AuthTab): RouteObject {
  return {
    path,
    lazy: async () => {
      const { AuthPage } = await import('./pages/AuthPage/AuthPage');
      return { element: createElement(AuthPage, { tab }) };
    },
  };
}

export const authRoutes: RouteObject[] = [
  {
    element: createElement(AuthLayout),
    children: [authPageRoute(paths.login, 'login'), authPageRoute(paths.register, 'register')],
  },
];
