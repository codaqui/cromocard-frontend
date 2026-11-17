import { useState } from 'react';

import { ApiError } from '@/lib/api-error';

import { useCastVote } from '../catalog-request-votes.queries';
import type { CatalogVote, VotingSuggestion } from '../catalog-request-votes.types';

const isVotingClosed = (error: unknown) =>
  error instanceof ApiError && error.code === 'VOTING_CLOSED';

/** Vota e, se a sugestão já foi analisada (R8), guarda qual foi para o aviso do frame 1038-2242. */
export function useSuggestionVote() {
  const mutation = useCastVote();
  const [closedCode, setClosedCode] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const vote = (suggestion: VotingSuggestion, choice: CatalogVote) => {
    mutation.mutate(
      { id: suggestion.id, vote: choice },
      {
        onError: (error) =>
          isVotingClosed(error) ? setClosedCode(suggestion.code) : setFailure(error.message),
      },
    );
  };

  const dismiss = () => {
    setClosedCode(null);
    setFailure(null);
  };

  return {
    vote,
    pendingId: mutation.isPending ? mutation.variables?.id : undefined,
    closedCode,
    failure,
    dismiss,
  };
}

export type SuggestionVote = ReturnType<typeof useSuggestionVote>;
