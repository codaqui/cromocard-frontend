import { describe, expect, it } from 'vitest';

import {
  closedVotingDetail,
  countLabel,
  countWithShare,
  handleOf,
  votesLabel,
} from './catalog-request-votes.format';

describe('countWithShare', () => {
  it('mostra a quantidade e a parte do total com uma casa decimal, como no Figma', () => {
    expect(countWithShare(331, 340)).toBe('331 (97,4%)');
    expect(countWithShare(3, 340)).toBe('3 (0,9%)');
  });

  it('sem votos mostra 0,0% em vez de dividir por zero', () => {
    expect(countWithShare(0, 0)).toBe('0 (0,0%)');
  });
});

describe('rótulos', () => {
  it('usa singular e plural', () => {
    expect(votesLabel(1)).toBe('1 voto');
    expect(votesLabel(340)).toBe('340 votos');
    expect(countLabel(1, 'voto seu', 'votos seus')).toBe('1 voto seu');
    expect(countLabel(2, 'voto seu', 'votos seus')).toBe('2 votos seus');
  });

  it('mostra o @ de quem sugeriu, ou o nome quando não tem usuário', () => {
    const requester = { id: 'u1', name: 'Ana Souza', username: 'ana' };
    expect(handleOf({ requester })).toBe('@ana');
    expect(handleOf({ requester: { ...requester, username: null } })).toBe('Ana Souza');
  });

  it('diz qual sugestão encerrou a votação', () => {
    expect(closedVotingDetail('#SOL-0031')).toBe(
      'A sugestão #SOL-0031 já foi analisada pela equipe e não aceita mais votos.',
    );
  });
});
