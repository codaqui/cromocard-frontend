import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { catalogRequestsApi } from './catalog-requests.api';
import type { ListCatalogRequestsParams } from './catalog-requests.types';

export const catalogRequestsKeys = {
  all: ['admin', 'catalog-requests'] as const,
  list: (params: ListCatalogRequestsParams) =>
    [...catalogRequestsKeys.all, 'list', params] as const,
};

export function useCatalogRequests(params: ListCatalogRequestsParams) {
  return useQuery({
    queryKey: catalogRequestsKeys.list(params),
    queryFn: () => catalogRequestsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

function useReview<TInput>(request: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: request,
    onSettled: () => queryClient.invalidateQueries({ queryKey: catalogRequestsKeys.all }),
  });
}

export function useApproveRequest() {
  return useReview(catalogRequestsApi.approve);
}

export function useRejectRequest() {
  return useReview(catalogRequestsApi.reject);
}
