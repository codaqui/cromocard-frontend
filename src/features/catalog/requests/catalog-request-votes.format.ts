import type { VotingSuggestion } from './catalog-request-votes.types';

const SHARE = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

/** "331 (97,4%)": a quantidade e a parte do total, com uma casa decimal. */
export function countWithShare(count: number, total: number): string {
  const share = total === 0 ? 0 : (count / total) * 100;
  return `${count} (${SHARE.format(share)}%)`;
}

export const votesLabel = (total: number) => `${total} ${total === 1 ? 'voto' : 'votos'}`;

export const countLabel = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

export function handleOf({ requester }: Pick<VotingSuggestion, 'requester'>): string {
  return requester.username ? `@${requester.username}` : requester.name;
}

/** Texto do aviso do frame 1038-2242: qual sugestão encerrou. */
export const closedVotingDetail = (code: string) =>
  `A sugestão ${code} já foi analisada pela equipe e não aceita mais votos.`;
