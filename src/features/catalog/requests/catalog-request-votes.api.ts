import { api } from '@/lib/http';

import type {
  CastVoteInput,
  ListVotingParams,
  VotingSuggestion,
} from './catalog-request-votes.types';

const BASE = '/catalog-requests';

export const catalogRequestVotesApi = {
  list: (params: ListVotingParams) => api.getPage<VotingSuggestion>(`${BASE}/voting`, params),
  vote: ({ id, vote }: CastVoteInput) => api.put<VotingSuggestion>(`${BASE}/${id}/vote`, { vote }),
};
