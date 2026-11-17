import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-error';

import {
  alreadyReviewedMessage,
  approvalFailureMessage,
  cardsLabel,
  categoryApprovalNote,
  checklistFileName,
  percentLabel,
  populationLabel,
  quorumHeadline,
  rarityPluralLabel,
  handleOf,
  initialsOf,
  isAlreadyReviewed,
  itemNameOf,
  reviewMoment,
} from './catalog-requests.format';
import type { CatalogRequest } from './catalog-requests.types';

const request: CatalogRequest = {
  id: '0199a000-0000-7000-8000-000000004091',
  code: '#SOL-4091',
  type: 'CARD',
  status: 'PENDING',
  data: { name: 'Roronoa Zoro', number: '022' },
  references: { album: 'One Piece: Wings of the Captain (OP-06)' },
  requester: { id: 'user-1', name: 'Lucas Slab', username: 'lucas_slab_collector' },
  reviewedBy: null,
  reviewedAt: null,
  createdAt: '2026-11-10T12:00:00Z',
  votes: null,
  checklistSummary: null,
};

const reviewed = (status: string, reviewedBy: string) =>
  new ApiError({
    status: 409,
    code: 'REQUEST_ALREADY_REVIEWED',
    message: 'Esta solicitação já foi analisada',
    details: [
      { field: 'status', message: status },
      { field: 'reviewedBy', message: reviewedBy },
      { field: 'reviewedAt', message: '2026-11-12T17:52:00.000Z' },
    ],
  });

describe('catalog-requests.format', () => {
  it('usa o título no álbum e o nome nos outros tipos', () => {
    expect(itemNameOf(request)).toBe('Roronoa Zoro');
    expect(itemNameOf({ type: 'ALBUM', data: { title: 'OP-06' } })).toBe('OP-06');
    expect(itemNameOf({ type: 'CATEGORY', data: {} })).toBe('');
  });

  it('mostra o @ do solicitante, ou o nome quando ele não tem @', () => {
    expect(handleOf(request.requester)).toBe('@lucas_slab_collector');
    expect(handleOf({ name: 'Ana Souza', username: null })).toBe('Ana Souza');
    expect(initialsOf(request.requester)).toBe('LS');
    expect(initialsOf({ name: 'Ana Souza', username: null })).toBe('AS');
    expect(initialsOf({ name: 'Bruno', username: null })).toBe('BR');
  });

  it('diz "hoje às" no mesmo dia e a data nos outros, no horário de Brasília', () => {
    const now = new Date('2026-11-12T20:00:00Z');

    expect(reviewMoment('2026-11-12T17:52:00Z', now)).toBe('hoje às 14:52');
    expect(reviewMoment('2026-11-10T17:52:00Z', now)).toBe('em 10/11/2026 às 14:52');
  });

  it('CA5: explica quem analisou, como e quando (frame 847-1878)', () => {
    const message = alreadyReviewedMessage(request, reviewed('APPROVED', 'fernanda_bi'));

    expect(message).toMatch(
      /^A sugestão #SOL-4091 \(Roronoa Zoro\) foi aprovada por @fernanda_bi (hoje|em \d{2}\/\d{2}\/\d{4}) às \d{2}:\d{2} e não está mais disponível para aprovação\.$/,
    );
    expect(alreadyReviewedMessage(request, reviewed('REJECTED', ''))).toContain('foi recusada ');
    expect(isAlreadyReviewed(reviewed('APPROVED', 'x'))).toBe(true);
    expect(isAlreadyReviewed(new Error('x'))).toBe(false);
  });

  it('CA5: sem detalhes no erro, não inventa quem nem quando', () => {
    const bare = new ApiError({ status: 409, code: 'REQUEST_ALREADY_REVIEWED', message: 'x' });

    expect(alreadyReviewedMessage(request, bare)).toBe(
      'A sugestão #SOL-4091 (Roronoa Zoro) foi aprovada e não está mais disponível para aprovação.',
    );
  });

  it('CA6: número repetido diz o número, o álbum e que continua pendente (frame 847-2371)', () => {
    const error = new ApiError({ status: 409, code: 'CARD_NUMBER_TAKEN', message: 'x' });

    expect(approvalFailureMessage(request, error)).toBe(
      'O número 022 já existe no álbum One Piece: Wings of the Captain (OP-06). A solicitação continua pendente; ajuste o álbum na Gestão de Catálogo e tente de novo.',
    );
  });

  it('CA8: dado faltando lista os campos em português', () => {
    const error = new ApiError({
      status: 422,
      code: 'REQUEST_DATA_INCOMPLETE',
      message: 'x',
      details: [
        { field: 'languageId', message: 'obrigatório' },
        { field: 'outro', message: 'obrigatório' },
      ],
    });

    expect(approvalFailureMessage(request, error)).toBe(
      'Faltam dados obrigatórios para publicar: idioma, outro. A solicitação continua pendente.',
    );
  });

  it('outros erros mantêm a mensagem e avisam que continua pendente', () => {
    const apiError = new ApiError({
      status: 404,
      code: 'ALBUM_NOT_FOUND',
      message: 'Álbum não encontrado.',
    });

    expect(approvalFailureMessage(request, apiError)).toBe(
      'Álbum não encontrado. A solicitação continua pendente.',
    );
    expect(approvalFailureMessage(request, new Error('Sem conexão.'))).toBe(
      'Sem conexão. A solicitação continua pendente.',
    );
  });

  it('casos de borda: @ já presente, nome de uma letra, número e álbum ausentes, sem detalhes', () => {
    expect(alreadyReviewedMessage(request, reviewed('APPROVED', '@ana'))).toContain('por @ana ');
    expect(initialsOf({ name: 'A', username: null })).toBe('A');
    const taken = new ApiError({ status: 409, code: 'CARD_NUMBER_TAKEN', message: 'x' });
    expect(approvalFailureMessage({ ...request, data: {}, references: {} }, taken)).toMatch(
      /^O número {2}já existe no álbum \./,
    );
    const incomplete = new ApiError({ status: 422, code: 'REQUEST_DATA_INCOMPLETE', message: 'x' });
    expect(approvalFailureMessage(request, incomplete)).toBe(
      'Faltam dados obrigatórios para publicar. A solicitação continua pendente.',
    );
  });
});

describe('textos da CCD103', () => {
  it('formata percentuais, cartas e população em pt-BR', () => {
    expect(percentLabel(97.4)).toBe('97,4%');
    expect(percentLabel(170)).toBe('170%');
    expect(cardsLabel(1)).toBe('1 carta');
    expect(cardsLabel(1260)).toBe('1.260 cartas');
    expect(populationLabel(1)).toBe('1 Cópia Global');
    expect(populationLabel(39)).toBe('39 Cópias Globais');
  });

  it('põe a raridade no plural do resumo', () => {
    expect(rarityPluralLabel('Lendária')).toBe('Lendárias');
    expect(rarityPluralLabel('Comum')).toBe('Comuns');
    expect(rarityPluralLabel('Incomum')).toBe('Incomuns');
  });

  it('resume o quórum e o rodapé da categoria', () => {
    const votes = {
      for: 331,
      neutral: 6,
      against: 3,
      total: 340,
      goal: 200,
      forPercent: 97.4,
      goalPercent: 170,
    };
    expect(quorumHeadline(votes)).toBe('340 / 200 Votos (170% da Meta)');
    expect(categoryApprovalNote(0)).toBe(
      'Ao aprovar, a categoria é criada e a votação é encerrada.',
    );
    expect(categoryApprovalNote(1)).toBe(
      'Ao aprovar, a categoria e a subcategoria são criadas e a votação é encerrada.',
    );
    expect(categoryApprovalNote(5)).toBe(
      'Ao aprovar, a categoria e as 5 subcategorias são criadas e a votação é encerrada.',
    );
  });

  it('usa o protocolo no nome da planilha', () => {
    expect(checklistFileName({ code: '#SOL-4091' })).toBe('checklist-SOL-4091.csv');
  });
});
