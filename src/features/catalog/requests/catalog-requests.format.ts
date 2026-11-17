import { ApiError, type ApiErrorDetail } from '@/lib/api-error';

import type { CatalogRequest, RequestPerson } from './catalog-requests.types';

const TIME = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});
const DATE = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

const FIELD_LABELS: Record<string, string> = {
  categoryId: 'franquia',
  rarityId: 'raridade',
  languageId: 'idioma',
  frontImageUrl: 'imagem da frente',
  name: 'nome',
  title: 'título',
  type: 'tipo',
};

const STILL_PENDING = 'A solicitação continua pendente.';

export function itemNameOf({ type, data }: Pick<CatalogRequest, 'type' | 'data'>): string {
  return (type === 'ALBUM' ? data.title : data.name) ?? '';
}

export function handleOf(person: Pick<RequestPerson, 'name' | 'username'>): string {
  return person.username ? `@${person.username}` : person.name;
}

export function initialsOf(person: Pick<RequestPerson, 'name' | 'username'>): string {
  const [first, second] = (person.username ?? person.name).split(/[\s_.-]+/);
  return `${first?.[0] ?? ''}${second?.[0] ?? first?.[1] ?? ''}`.toUpperCase();
}

/** "hoje às 14:52" ou "em 12/11/2026 às 14:52", no horário de Brasília. */
export function reviewMoment(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const day = DATE.format(date) === DATE.format(now) ? 'hoje' : `em ${DATE.format(date)}`;
  return `${day} às ${TIME.format(date)}`;
}

const detailOf = (details: ApiErrorDetail[] | undefined, field: string) =>
  details?.find((detail) => detail.field === field)?.message ?? '';

/** Texto do frame 847-1878, a partir do `409 REQUEST_ALREADY_REVIEWED` (quem, quando e como). */
export function alreadyReviewedMessage(request: CatalogRequest, error: ApiError): string {
  const verb = detailOf(error.details, 'status') === 'REJECTED' ? 'recusada' : 'aprovada';
  const reviewer = detailOf(error.details, 'reviewedBy');
  const reviewedAt = detailOf(error.details, 'reviewedAt');
  const by = reviewer ? ` por ${reviewer.startsWith('@') ? reviewer : `@${reviewer}`}` : '';
  const when = reviewedAt ? ` ${reviewMoment(reviewedAt)}` : '';
  return `A sugestão ${request.code} (${itemNameOf(request)}) foi ${verb}${by}${when} e não está mais disponível para aprovação.`;
}

/** Texto do frame 847-2371: o motivo do conflito e que a solicitação continua pendente (R16). */
export function approvalFailureMessage(request: CatalogRequest, error: Error): string {
  if (!(error instanceof ApiError)) return `${error.message} ${STILL_PENDING}`;
  if (error.code === 'CARD_NUMBER_TAKEN') {
    return `O número ${request.data.number ?? ''} já existe no álbum ${request.references.album ?? ''}. A solicitação continua pendente; ajuste o álbum na Gestão de Catálogo e tente de novo.`;
  }
  if (error.code === 'REQUEST_DATA_INCOMPLETE') {
    const fields = (error.details ?? []).map(({ field }) => FIELD_LABELS[field] ?? field);
    return `Faltam dados obrigatórios para publicar: ${fields.join(', ')}. ${STILL_PENDING}`;
  }
  return `${error.message} ${STILL_PENDING}`;
}

export const isAlreadyReviewed = (error: unknown): error is ApiError =>
  error instanceof ApiError && error.code === 'REQUEST_ALREADY_REVIEWED';
