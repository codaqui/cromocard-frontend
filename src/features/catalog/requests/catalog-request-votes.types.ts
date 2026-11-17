import type { PaginationParams } from '@/types/api';

import type { RequestPerson } from './catalog-requests.types';

export type CatalogVote = 'FOR' | 'NEUTRAL' | 'AGAINST';

export interface VoteTally {
  for: number;
  neutral: number;
  against: number;
  total: number;
}

/** Sugestão de categoria aberta para votação (CCD103), com o voto de quem está logado. */
export interface VotingSuggestion {
  id: string;
  code: string;
  name: string;
  description: string | null;
  requester: RequestPerson;
  votes: VoteTally;
  myVote: CatalogVote | null;
  createdAt: string;
}

export type ListVotingParams = PaginationParams;

export interface CastVoteInput {
  id: string;
  vote: CatalogVote;
}
