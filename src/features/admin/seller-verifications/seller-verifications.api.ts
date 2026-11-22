import { api } from '@/lib/http';

import type { AddNoteInput, ApproveInput, RejectInput } from './seller-verifications.schemas';
import type {
  ListSellerVerificationsParams,
  SellerVerificationDetail,
  SellerVerificationListItem,
  SellerVerificationPeriodParams,
  SellerVerificationSummary,
} from './seller-verifications.types';

export const sellerVerificationsApi = {
  list: (params: ListSellerVerificationsParams) =>
    api.getPage<SellerVerificationListItem>('/admin/seller-verifications', params),
  getSummary: (params: SellerVerificationPeriodParams) =>
    api.get<SellerVerificationSummary>('/admin/seller-verifications/summary', params),
  getById: (id: string) => api.get<SellerVerificationDetail>(`/admin/seller-verifications/${id}`),
  validateDocument: (id: string, documentId: string) =>
    api.post<SellerVerificationDetail>(
      `/admin/seller-verifications/${id}/documents/${documentId}/validate`,
    ),
  addNote: (id: string, input: AddNoteInput) =>
    api.post<SellerVerificationDetail>(`/admin/seller-verifications/${id}/notes`, input),
  approve: (id: string, input: ApproveInput) =>
    api.post<SellerVerificationDetail>(`/admin/seller-verifications/${id}/approve`, input),
  reject: (id: string, input: RejectInput) =>
    api.post<SellerVerificationDetail>(`/admin/seller-verifications/${id}/reject`, input),
};
