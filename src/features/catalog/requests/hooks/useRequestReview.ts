import { useState } from 'react';

import {
  alreadyReviewedMessage,
  approvalFailureMessage,
  isAlreadyReviewed,
  itemNameOf,
  rejectionFailureMessage,
} from '../catalog-requests.format';
import { useApproveRequest, useRejectRequest } from '../catalog-requests.queries';
import type { CatalogRequest } from '../catalog-requests.types';

export type ReviewStep =
  | { kind: 'idle' }
  | { kind: 'approving'; request: CatalogRequest }
  | { kind: 'rejecting'; request: CatalogRequest }
  | { kind: 'reviewed'; message: string }
  | { kind: 'failed'; action: ReviewAction; message: string };

export type ReviewAction = 'approve' | 'reject';

const IDLE: ReviewStep = { kind: 'idle' };

const FAILURE_MESSAGES: Record<ReviewAction, (request: CatalogRequest, error: Error) => string> = {
  approve: approvalFailureMessage,
  reject: rejectionFailureMessage,
};

function failureStep(action: ReviewAction, request: CatalogRequest, error: Error): ReviewStep {
  if (isAlreadyReviewed(error)) {
    return { kind: 'reviewed', message: alreadyReviewedMessage(request, error) };
  }
  return { kind: 'failed', action, message: FAILURE_MESSAGES[action](request, error) };
}

const approvedDetail = (request: CatalogRequest) =>
  `${itemNameOf(request)} entrou no catálogo. O solicitante foi avisado.`;

function useReviewMutations(
  setStep: (step: ReviewStep) => void,
  showApproved: (detail: string | null) => void,
) {
  const approval = useApproveRequest();
  const rejection = useRejectRequest();
  const failWith = (action: ReviewAction, request: CatalogRequest) => (error: Error) =>
    setStep(failureStep(action, request, error));

  return {
    isApproving: approval.isPending,
    isRejecting: rejection.isPending,
    approve: (request: CatalogRequest) =>
      approval.mutate(request.id, {
        onSuccess: () => showApproved(approvedDetail(request)),
        onError: failWith('approve', request),
      }),
    reject: (request: CatalogRequest, reason: string) =>
      rejection.mutate(
        { id: request.id, reason },
        { onSuccess: () => setStep(IDLE), onError: failWith('reject', request) },
      ),
  };
}

export function useRequestReview() {
  const [step, setStep] = useState<ReviewStep>(IDLE);
  const [approvedNotice, setApprovedNotice] = useState<string | null>(null);

  return {
    step,
    approvedNotice,
    dismissApproved: () => setApprovedNotice(null),
    ...useReviewMutations(setStep, (detail) => {
      setStep(IDLE);
      setApprovedNotice(detail);
    }),
    askApproval: (request: CatalogRequest) => setStep({ kind: 'approving', request }),
    askRejection: (request: CatalogRequest) => setStep({ kind: 'rejecting', request }),
    close: () => setStep(IDLE),
  };
}

export type RequestReview = ReturnType<typeof useRequestReview>;
