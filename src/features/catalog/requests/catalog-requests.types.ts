import type { PaginationMeta, PaginationParams } from '@/types/api';

export type CatalogRequestType = 'CARD' | 'ALBUM' | 'CATEGORY';

export type CatalogRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type RequestTab = 'ALL' | CatalogRequestType;

export interface RequestPerson {
  id: string;
  name: string;
  username: string | null;
}

export interface SuggestedReferences {
  album?: string;
  category?: string;
  rarity?: string;
  language?: string;
}

/** Dados sugeridos pelo cliente (`catalog_requests.data`); cada tipo usa os seus. */
export interface SuggestedData {
  name?: string;
  title?: string;
  number?: string;
  publisher?: string;
  year?: number;
  type?: 'ALBUM' | 'CARD';
  frontImageUrl?: string;
  backImageUrl?: string;
}

export interface CatalogRequest {
  id: string;
  code: string;
  type: CatalogRequestType;
  status: CatalogRequestStatus;
  data: SuggestedData;
  references: SuggestedReferences;
  requester: RequestPerson;
  reviewedBy: RequestPerson | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface CatalogRequestsMeta extends PaginationMeta {
  pendingByType: Record<RequestTab, number>;
}

export interface ListCatalogRequestsParams extends PaginationParams {
  type?: CatalogRequestType;
}

export interface RejectRequestInput {
  id: string;
  reason: string;
}
