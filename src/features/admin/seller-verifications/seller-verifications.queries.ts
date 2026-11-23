import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { usersKeys } from '@/features/users';

import { sellerVerificationsApi } from './seller-verifications.api';
import type {
  AddNoteInput,
  ApproveInput,
  RejectInput,
  SendPendingNoticeInput,
} from './seller-verifications.schemas';
import type {
  ListSellerVerificationsParams,
  SellerVerificationPeriodParams,
} from './seller-verifications.types';

export const sellerVerificationsKeys = {
  all: ['admin', 'seller-verifications'] as const,
  list: (params: ListSellerVerificationsParams) =>
    [...sellerVerificationsKeys.all, 'list', params] as const,
  summary: (params: SellerVerificationPeriodParams) =>
    [...sellerVerificationsKeys.all, 'summary', params] as const,
  detail: (id: string) => [...sellerVerificationsKeys.all, 'detail', id] as const,
  pendingTemplates: () => [...sellerVerificationsKeys.all, 'pending-templates'] as const,
};

function invalidateSellerVerifications(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: sellerVerificationsKeys.all });
}

function invalidateAfterDecision(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
  return invalidateSellerVerifications(queryClient);
}

export function useSellerVerificationsList(params: ListSellerVerificationsParams) {
  return useQuery({
    queryKey: sellerVerificationsKeys.list(params),
    queryFn: () => sellerVerificationsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useSellerVerificationsSummary(params: SellerVerificationPeriodParams) {
  return useQuery({
    queryKey: sellerVerificationsKeys.summary(params),
    queryFn: () => sellerVerificationsApi.getSummary(params),
    placeholderData: keepPreviousData,
  });
}

export function useSellerVerification(id: string) {
  return useQuery({
    queryKey: sellerVerificationsKeys.detail(id),
    queryFn: () => sellerVerificationsApi.getById(id),
  });
}

export function useValidateSellerDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, documentId }: { id: string; documentId: string }) =>
      sellerVerificationsApi.validateDocument(id, documentId),
    onSuccess: () => invalidateSellerVerifications(queryClient),
  });
}

export function useAddSellerVerificationNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AddNoteInput }) =>
      sellerVerificationsApi.addNote(id, input),
    onSuccess: () => invalidateSellerVerifications(queryClient),
  });
}

export function useApproveSellerVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApproveInput }) =>
      sellerVerificationsApi.approve(id, input),
    onSuccess: () => invalidateAfterDecision(queryClient),
  });
}

export function useRejectSellerVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RejectInput }) =>
      sellerVerificationsApi.reject(id, input),
    onSuccess: () => invalidateAfterDecision(queryClient),
  });
}

export function usePendingTemplates() {
  return useQuery({
    queryKey: sellerVerificationsKeys.pendingTemplates(),
    queryFn: sellerVerificationsApi.getPendingTemplates,
  });
}

export function useSendPendingNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SendPendingNoticeInput }) =>
      sellerVerificationsApi.sendPendingNotice(id, input),
    onSuccess: () => invalidateSellerVerifications(queryClient),
  });
}
