import type { BadgeTone } from '@/components/Badge/Badge';
import type { SellerVerificationStatus } from '@/types/seller-verification';

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

const DECIDABLE_STATUSES: SellerVerificationStatus[] = ['UNDER_REVIEW', 'PENDING'];

export function canDecide(status: SellerVerificationStatus): boolean {
  return DECIDABLE_STATUSES.includes(status);
}
