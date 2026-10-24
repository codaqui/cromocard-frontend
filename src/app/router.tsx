import { createBrowserRouter, Navigate } from 'react-router';

import { ErrorState } from '@/components/ErrorState/ErrorState';
import { NotFoundPage } from '@/components/NotFoundPage/NotFoundPage';
import { adminBackofficeRoutes } from '@/features/admin';
import { usersBackofficeRoutes, usersRoutes } from '@/features/users';
import { RequireAuth } from '@/routes/guards/RequireAuth';
import { RequireRole } from '@/routes/guards/RequireRole';
import { paths } from '@/routes/paths';
import { RoleHomeRedirect } from '@/routes/RoleHomeRedirect';

import { AdminLayout } from './layouts/AdminLayout/AdminLayout';
import { CustomerLayout } from './layouts/CustomerLayout/CustomerLayout';
import { PublicLayout } from './layouts/PublicLayout/PublicLayout';

export const router = createBrowserRouter([
  {
    errorElement: <ErrorState />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <RoleHomeRedirect /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [{ element: <CustomerLayout />, children: usersRoutes }],
      },
      {
        path: paths.backoffice.root,
        element: <RequireRole role="ADMIN" />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to={paths.backoffice.dashboard} replace /> },
              ...adminBackofficeRoutes,
              ...usersBackofficeRoutes,
            ],
          },
        ],
      },
    ],
  },
]);
