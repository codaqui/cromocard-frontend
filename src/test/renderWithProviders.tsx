import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { vi } from 'vitest';

import { AuthContext } from '@/contexts/AuthContext';
import type { AuthenticatedUser } from '@/types/authenticated-user';

interface RenderWithProvidersOptions {
  routes: RouteObject[];
  initialPath: string;
  user?: AuthenticatedUser | null;
}

export function renderWithProviders({
  routes,
  initialPath,
  user = null,
}: RenderWithProvidersOptions) {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <AuthContext value={{ user, signOut: vi.fn() }}>
        <RouterProvider router={router} />
      </AuthContext>
    </QueryClientProvider>,
  );

  return router;
}
