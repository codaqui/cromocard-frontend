import { QueryClient } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-error';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

const MAX_RETRIES = 2;

function shouldRetry(failureCount: number, error: ApiError): boolean {
  const isClientError = error.status >= 400 && error.status < 500;
  return !isClientError && failureCount < MAX_RETRIES;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: shouldRetry },
  },
});
