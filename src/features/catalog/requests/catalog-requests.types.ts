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

export interface SuggestionSource {
  label: string;
  url?: string;
}

export interface ChecklistItem {
  number?: string;
  code?: string;
  name?: string;
  /** Nome da raridade do seed, resolvido pela API. */
  rarity?: string;
  variants?: string;
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
  /** Carta (CCD103, R10). */
  illustrator?: string;
  estimatedPopulation?: number;
  justification?: string;
  sources?: SuggestionSource[];
  /** Álbum (CCD103, R11, R13). */
  coverImageUrl?: string;
  checklist?: ChecklistItem[];
  /** Categoria (CCD103, R12, R13). */
  description?: string;
  logoUrl?: string;
  subcategories?: string[];
}

/** Quórum da sugestão de categoria (CCD103, R5); percentuais com uma casa decimal. */
export interface QuorumVotes {
  for: number;
  neutral: number;
  against: number;
  total: number;
  goal: number;
  forPercent: number;
  goalPercent: number;
}

export interface ChecklistSummary {
  total: number;
  rarities: { name: string; count: number }[];
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
  votes: QuorumVotes | null;
  checklistSummary: ChecklistSummary | null;
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
