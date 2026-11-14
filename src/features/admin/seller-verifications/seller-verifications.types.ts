import type { PeriodPreset } from '@/components/PeriodFilter/PeriodFilter';
import type { PaginationParams } from '@/types/api';
import type { SellerVerificationStatus } from '@/types/seller-verification';

export interface SellerVerificationListItem {
  id: string;
  status: SellerVerificationStatus;
  legalName: string;
  cnpj: string;
  createdAt: string;
  seller: { id: string; name: string; email: string };
}

export interface SellerDocument {
  id: string;
  type: string;
  fileUrl: string;
  fileSize: number | null;
  status: 'SUBMITTED' | 'VALIDATED';
  validatedAt: string | null;
  validatedById: string | null;
  createdAt: string;
}

export interface SellerVerificationNote {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string };
}

export interface SellerVerificationDetail {
  id: string;
  status: SellerVerificationStatus;
  legalName: string;
  tradeName: string | null;
  cnpj: string;
  stateRegistration: string | null;
  openingDate: string | null;
  companySize: string | null;
  cnae: string | null;
  responsibleName: string;
  responsibleCpf: string;
  responsiblePhone: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccount: string | null;
  pixKey: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  seller: { id: string; name: string; email: string };
  documents: SellerDocument[];
  notes: SellerVerificationNote[];
}

export interface ListSellerVerificationsParams extends PaginationParams {
  status?: SellerVerificationStatus;
}

export type SellerVerificationPeriodParams = { period: PeriodPreset } | { from: string; to: string };

export interface SellerVerificationSummary {
  approved: number;
  pending: number;
  conversionRate: number;
}
