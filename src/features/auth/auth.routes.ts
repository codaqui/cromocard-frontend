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

const checkEmailRoute: RouteObject = {
  path: paths.checkEmail,
  lazy: async () => ({
    Component: (await import('./pages/CheckEmailPage/CheckEmailPage')).CheckEmailPage,
  }),
};

const forgotPasswordRoute: RouteObject = {
  path: paths.forgotPassword,
  lazy: async () => ({
    Component: (await import('./pages/ForgotPasswordPage/ForgotPasswordPage')).ForgotPasswordPage,
  }),
};

const verifyEmailRoute: RouteObject = {
  path: paths.verifyEmail,
  lazy: async () => ({
    Component: (await import('./pages/VerifyEmailPage/VerifyEmailPage')).VerifyEmailPage,
  }),
};

export const authRoutes: RouteObject[] = [
  {
    element: createElement(AuthLayout),
    children: [
      authPageRoute(paths.login, 'login'),
      authPageRoute(paths.register, 'register'),
      checkEmailRoute,
      forgotPasswordRoute,
    ],
  },
];

const resetPasswordRoute: RouteObject = {
  path: paths.resetPassword,
  lazy: async () => ({
    Component: (await import('./pages/ResetPasswordPage/ResetPasswordPage')).ResetPasswordPage,
  }),
};

export const tokenLinkRoutes: RouteObject[] = [
  { element: createElement(AuthLayout), children: [verifyEmailRoute, resetPasswordRoute] },
];
