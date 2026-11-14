import type { BadgeTone } from '@/components/Badge/Badge';
import type { SelectOption } from '@/components/Select/Select';
import type { SellerVerificationStatus } from '@/types/seller-verification';

import { DEADLINE_HOURS_OPTIONS, type DeadlineHours } from './seller-verifications.types';

export const statusLabels: Record<SellerVerificationStatus, string> = {
  UNDER_REVIEW: 'Em análise',
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Reprovado',
};

export const statusTones: Record<SellerVerificationStatus, BadgeTone> = {
  UNDER_REVIEW: 'warning',
  PENDING: 'info',
  APPROVED: 'success',
  REJECTED: 'danger',
};

export const documentTypeLabels: Record<string, string> = {
  CNPJ_CARD: 'Cartão CNPJ',
  ADDRESS_PROOF: 'Comprovante de endereço',
};

export const sellerVerificationMessages = {
  documentValidated: 'Documento validado com sucesso.',
  noteAdded: 'Anotação registrada com sucesso.',
  approved: 'Credenciamento aprovado com sucesso.',
  rejected: 'Credenciamento reprovado com sucesso.',
} as const;

export const deadlineHoursLabels: Record<DeadlineHours, string> = {
  24: '24 horas',
  48: '48 horas (padrão)',
  72: '72 horas',
  168: '7 dias',
};

export const deadlineHoursOptions: SelectOption[] = DEADLINE_HOURS_OPTIONS.map((hours) => ({
  value: String(hours),
  label: deadlineHoursLabels[hours],
}));

export const DEFAULT_DEADLINE_HOURS: DeadlineHours = 48;

const DECIDABLE_STATUSES: SellerVerificationStatus[] = ['UNDER_REVIEW', 'PENDING'];

export function canDecide(status: SellerVerificationStatus): boolean {
  return DECIDABLE_STATUSES.includes(status);
}
