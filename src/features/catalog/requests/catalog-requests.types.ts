import type { VoteTally } from './catalog-request-votes.types';
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
  rarity?: string;
  variants?: string;
}

export interface SuggestedData {
  name?: string;
  title?: string;
  number?: string;
  publisher?: string;
  year?: number;
  type?: 'ALBUM' | 'CARD';
  frontImageUrl?: string;
  backImageUrl?: string;
  illustrator?: string;
  estimatedPopulation?: number;
  justification?: string;
  sources?: SuggestionSource[];
  coverImageUrl?: string;
  checklist?: ChecklistItem[];
  description?: string;
  logoUrl?: string;
  subcategories?: string[];
}

export interface QuorumVotes extends VoteTally {
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
