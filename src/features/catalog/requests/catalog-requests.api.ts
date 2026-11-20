import { api } from '@/lib/http';

import type {
  CatalogRequest,
  CatalogRequestsMeta,
  ListCatalogRequestsParams,
  RejectRequestInput,
} from './catalog-requests.types';

const BASE = '/admin/catalog-requests';

export const catalogRequestsApi = {
  list: (params: ListCatalogRequestsParams) =>
    api.getPage<CatalogRequest, CatalogRequestsMeta>(BASE, params),
  approve: (id: string) => api.post<CatalogRequest>(`${BASE}/${id}/approve`),
  reject: ({ id, reason }: RejectRequestInput) =>
    api.post<CatalogRequest>(`${BASE}/${id}/reject`, { reason }),
};
