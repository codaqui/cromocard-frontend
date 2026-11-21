import type { IconName } from '@/components/Icon/icon-paths';

import type { CatalogVote } from './catalog-request-votes.types';

export const SUGGESTIONS_PAGE_SIZE = 10;

export interface VoteOption {
  vote: CatalogVote;
  label: string;
  icon: IconName;
}

export const VOTE_OPTIONS: VoteOption[] = [
  { vote: 'FOR', label: 'A favor', icon: 'thumbUp' },
  { vote: 'NEUTRAL', label: 'Neutro', icon: 'remove' },
  { vote: 'AGAINST', label: 'Contra', icon: 'thumbDown' },
];

const VOTED_TEXT: Record<CatalogVote, string> = {
  FOR: 'a favor',
  NEUTRAL: 'neutro',
  AGAINST: 'contra',
};

export function myVoteText(vote: CatalogVote | null): string {
  if (!vote) return 'Você ainda não votou nesta sugestão.';
  return `Você votou ${VOTED_TEXT[vote]}. Você pode trocar o voto enquanto a votação estiver aberta.`;
}

export const VOTING_CLOSED_TITLE = 'Votação encerrada';
