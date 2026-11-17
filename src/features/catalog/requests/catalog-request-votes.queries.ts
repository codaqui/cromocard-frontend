import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { catalogRequestVotesApi } from './catalog-request-votes.api';
import type { ListVotingParams } from './catalog-request-votes.types';

export const votingKeys = {
  all: ['catalog-requests', 'voting'] as const,
  list: (params: ListVotingParams) => [...votingKeys.all, 'list', params] as const,
};

export function useVotingSuggestions(params: ListVotingParams) {
  return useQuery({
    queryKey: votingKeys.list(params),
    queryFn: () => catalogRequestVotesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Depois do voto (ou da votação encerrada), a lista é buscada de novo: contagem e sugestões mudam. */
export function useCastVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: catalogRequestVotesApi.vote,
    onSettled: () => queryClient.invalidateQueries({ queryKey: votingKeys.all }),
  });
}
