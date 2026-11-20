import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

import { ApiError, type ApiErrorDetail } from '@/lib/api-error';

export function renderSettings(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
  return queryClient;
}

export function validationError(details: ApiErrorDetail[]): ApiError {
  return new ApiError({
    status: 400,
    code: 'VALIDATION_ERROR',
    message: 'Dados inválidos',
    details,
  });
}

export function imageFile(name: string, type: string): File {
  return new File([new Uint8Array(16)], name, { type });
}
