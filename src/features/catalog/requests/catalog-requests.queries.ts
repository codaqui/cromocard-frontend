import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { downloadFile } from '@/lib/download-file';

import { catalogRequestsApi } from './catalog-requests.api';
import { checklistFileName } from './catalog-requests.format';
import type { CatalogRequest, ListCatalogRequestsParams } from './catalog-requests.types';

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

/** Aprovar e recusar mudam a fila e os contadores: a lista é buscada de novo nos dois casos. */
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

/** Baixa a planilha do checklist do álbum sugerido (CCD103, R11). */
export function useDownloadChecklist() {
  return useMutation({
    mutationFn: async (request: Pick<CatalogRequest, 'id' | 'code'>) =>
      downloadFile(
        await catalogRequestsApi.downloadChecklist(request.id),
        checklistFileName(request),
      ),
  });
}
