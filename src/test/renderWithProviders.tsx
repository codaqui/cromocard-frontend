import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { Fragment, StrictMode } from 'react';
import { createMemoryRouter, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { vi } from 'vitest';

import { AuthContext } from '@/contexts/AuthContext';
import type { AuthenticatedUser } from '@/types/authenticated-user';

interface RenderWithProvidersOptions {
  routes: RouteObject[];
  initialPath: string;
  user?: AuthenticatedUser | null;
  isRestoringSession?: boolean;
  hasSignedOut?: boolean;
  signOut?: () => void;
  /** Renderiza dentro do `StrictMode`, que roda os efeitos duas vezes como no `npm run dev`. */
  strict?: boolean;
}

export function renderWithProviders({
  routes,
  initialPath,
  user = null,
  isRestoringSession = false,
  hasSignedOut = false,
  signOut = vi.fn(),
  strict = false,
}: RenderWithProvidersOptions) {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const Mode = strict ? StrictMode : Fragment;

  render(
    <Mode>
      <QueryClientProvider client={queryClient}>
        <AuthContext value={{ user, isRestoringSession, hasSignedOut, signIn: vi.fn(), signOut }}>
          <RouterProvider router={router} />
        </AuthContext>
      </QueryClientProvider>
    </Mode>,
  );

  return router;
}
